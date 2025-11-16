import * as k8s from '@kubernetes/client-node';
import yaml from 'js-yaml';
import { logger } from '../../utils/logger.ts';
import type { TaskMessage } from '../../utils/types.ts';

export interface JobResult {
  jobName: string;
  namespace: string;
  status: 'succeeded' | 'failed' | 'running';
  completionTime?: Date;
  failureReason?: string;
  response?: string | undefined;
  tasks?: TaskMessage[] | null | undefined;
}

/**
 * Apply a Kubernetes Job from the embedded YAML config, return the job name, and watch its status until completion.
 *
 * @param timeoutMs Optional timeout in milliseconds (default: 5 minutes)
 * @return Job result with name and final status
 */
export async function applyAndWatchJob(
  name: string,
  namespace: string,
  path: string,
  timeoutMs: number = 300000,
  ...scriptArgs: string[]
): Promise<JobResult> {
  // Normalize job name to be lowercase and RFC 1123 compliant
  const normalizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .substring(0, 63);

  // Kubernetes Job YAML configuration
  const serializedArgs = scriptArgs
    .map((arg) => JSON.stringify(arg))
    .join(', ');

  const JOB_YAML = `
  apiVersion: batch/v1
  kind: Job
  metadata:
    name: ${normalizedName}
    namespace: ${namespace}
  spec:
    template:
      spec:
        containers:
        - name: evaluator
          image: evaluation
          command: ["tsx", "${path}"${
    serializedArgs ? `, ${serializedArgs}` : ''
  }]
          env:
          - name: NODE_ENV
            value: "production"
        restartPolicy: OnFailure
    backoffLimit: 3
  `;

  logger.debug('Applying Job with spec:', JOB_YAML);

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  const batchV1Api = kc.makeApiClient(k8s.BatchV1Api);

  // Parse the Job spec from embedded YAML
  const jobSpec = yaml.load(JOB_YAML) as k8s.KubernetesObject;

  if (!jobSpec || !jobSpec.metadata || !jobSpec.metadata.name) {
    throw new Error('Invalid Job spec configuration');
  }

  const jobName = normalizedName;

  // Apply the Job (create or patch)
  jobSpec.metadata.annotations = jobSpec.metadata.annotations || {};
  jobSpec.metadata.annotations[
    'kubectl.kubernetes.io/last-applied-configuration'
  ] = JSON.stringify(jobSpec);

  try {
    // Try to get the existing Job
    const header = {
      apiVersion: jobSpec.apiVersion!,
      kind: jobSpec.kind!,
      metadata: {
        name: jobName,
        namespace: namespace,
      },
    };

    await client.read(header);
    // Job exists, delete and recreate it (Jobs are immutable)
    await batchV1Api.deleteNamespacedJob({ name: jobName, namespace });
    // Wait a bit for the deletion to complete
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await client.create(jobSpec);
  } catch (err) {
    // Job doesn't exist, create it
    if (err instanceof k8s.ApiException && err.code === 404) {
      await client.create(jobSpec);
    } else {
      throw err;
    }
  }

  // Watch the Job status
  const coreV1Api = kc.makeApiClient(k8s.CoreV1Api);
  return watchJobStatus(batchV1Api, coreV1Api, jobName, namespace, timeoutMs);
}

/**
 * Extract response and tasks from pod logs by looking for the special output marker
 */
async function extractJobResultFromLogs(
  coreV1Api: k8s.CoreV1Api,
  jobName: string,
  namespace: string
): Promise<{ response?: string; tasks?: TaskMessage[] | null }> {
  try {
    // List pods for this job
    const podsResponse = await coreV1Api.listNamespacedPod({
      namespace,
      labelSelector: `job-name=${jobName}`,
    });

    if (!podsResponse.items || podsResponse.items.length === 0) {
      logger.warn(`No pods found for job ${jobName}`);
      return {};
    }

    // Get the first pod (there should only be one for a job)
    const pod = podsResponse.items[0];
    const podName = pod?.metadata?.name || 'undefined';

    if (!podName) {
      logger.warn(`Pod name not found for job ${jobName}`);
      return {};
    }

    // Read pod logs
    const logsResponse = await coreV1Api.readNamespacedPodLog({
      name: podName,
      namespace,
    });

    // Look for the special JSON output marker in logs
    const logs = logsResponse;
    const lines = logs.split('\n');

    // Search for the line containing the job result JSON
    for (const line of lines) {
      if (line.includes('JOB_RESULT_JSON:')) {
        try {
          const jsonStr = line
            .substring(
              line.indexOf('JOB_RESULT_JSON:') + 'JOB_RESULT_JSON:'.length
            )
            .trim();
          const result = JSON.parse(jsonStr);
          logger.info(
            `Extracted job result from logs: ${JSON.stringify(result)}`
          );
          return {
            response: result.response,
            tasks: result.tasks,
          };
        } catch (parseErr) {
          logger.error('Failed to parse job result JSON from logs:', parseErr);
        }
      }
    }

    logger.warn(`No job result found in logs for job ${jobName}`);
    return {};
  } catch (err) {
    logger.error(
      `Failed to extract job result from logs for job ${jobName}:`,
      err
    );
    return {};
  }
}

/**
 * Watch a Kubernetes Job until it completes (succeeds or fails) or times out.
 */
async function watchJobStatus(
  batchV1Api: k8s.BatchV1Api,
  coreV1Api: k8s.CoreV1Api,
  jobName: string,
  namespace: string,
  timeoutMs: number
): Promise<JobResult> {
  const startTime = Date.now();
  logger.info(
    `Watching Job ${jobName} in namespace ${namespace} for completion...`
  );
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(async () => {
      try {
        // Check for timeout
        if (Date.now() - startTime > timeoutMs) {
          clearInterval(checkInterval);
          resolve({
            jobName,
            namespace,
            status: 'running',
            failureReason: 'Timeout exceeded while waiting for Job completion',
          });
          return;
        }

        // Get the current Job status
        const jobResponse = await batchV1Api.readNamespacedJobStatus({
          name: jobName,
          namespace,
        });
        const job = jobResponse;

        // Check if Job has succeeded
        if (job.status?.succeeded && job.status.succeeded > 0) {
          clearInterval(checkInterval);

          // Extract response and tasks from pod logs
          const jobResult = await extractJobResultFromLogs(
            coreV1Api,
            jobName,
            namespace
          );

          resolve({
            jobName,
            namespace,
            status: 'succeeded',
            completionTime: job.status.completionTime
              ? new Date(job.status.completionTime)
              : new Date(),
            response: jobResult.response,
            tasks: jobResult.tasks,
          });
          return;
        }

        // Check if Job has failed
        if (job.status?.failed && job.status.failed > 0) {
          clearInterval(checkInterval);
          const conditions = job.status.conditions || [];
          const failureCondition = conditions.find((c) => c.type === 'Failed');
          resolve({
            jobName,
            namespace,
            status: 'failed',
            failureReason:
              failureCondition?.message || 'Job failed without specific reason',
            completionTime: job.status.completionTime
              ? new Date(job.status.completionTime)
              : new Date(),
          });
          return;
        }

        // Job is still running
      } catch (err) {
        clearInterval(checkInterval);
        reject(err);
      }
    }, 2000); // Check every 2 seconds
  });
}
