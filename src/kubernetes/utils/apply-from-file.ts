import * as k8s from '@kubernetes/client-node';
import yaml from 'js-yaml';

export interface JobResult {
  jobName: string;
  namespace: string;
  status: 'succeeded' | 'failed' | 'running';
  completionTime?: Date;
  failureReason?: string;
}

/**
 * Apply a Kubernetes Job from the embedded YAML config, return the job name, and watch its status until completion.
 *
 * @param timeoutMs Optional timeout in milliseconds (default: 5 minutes)
 * @return Job result with name and final status
 */
export async function applyAndWatchJob(
  timeoutMs: number = 300000,
  projectExId: string,
  wsUrl: string,
  promptTemplate: string
): Promise<JobResult> {
  // Kubernetes Job YAML configuration
  const JOB_YAML = `
  apiVersion: batch/v1
  kind: Job
  metadata:
    name: evaluation-job
    namespace: default
  spec:
    template:
      spec:
        containers:
        - name: evaluator
          image: your-image:latest
          command: ["node", "dist/index.js", "${projectExId}", "${wsUrl}", "${promptTemplate}"]
          env:
          - name: NODE_ENV
            value: "production"
        restartPolicy: Never
    backoffLimit: 3
  `;

  const kc = new k8s.KubeConfig();
  kc.loadFromDefault();

  const client = k8s.KubernetesObjectApi.makeApiClient(kc);
  const batchV1Api = kc.makeApiClient(k8s.BatchV1Api);

  // Parse the Job spec from embedded YAML
  const jobSpec = yaml.load(JOB_YAML) as k8s.KubernetesObject;

  if (!jobSpec || !jobSpec.metadata || !jobSpec.metadata.name) {
    throw new Error('Invalid Job spec configuration');
  }

  const jobName = jobSpec.metadata.name;
  const namespace = jobSpec.metadata.namespace || 'default';

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
    await batchV1Api.deleteNamespacedJob({name: jobName, namespace});
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
  return watchJobStatus(batchV1Api, jobName, namespace, timeoutMs);
}

/**
 * Watch a Kubernetes Job until it completes (succeeds or fails) or times out.
 */
async function watchJobStatus(
  batchV1Api: k8s.BatchV1Api,
  jobName: string,
  namespace: string,
  timeoutMs: number
): Promise<JobResult> {
  const startTime = Date.now();

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
          namespace
        });
        const job = jobResponse;

        // Check if Job has succeeded
        if (job.status?.succeeded && job.status.succeeded > 0) {
          clearInterval(checkInterval);
          resolve({
            jobName,
            namespace,
            status: 'succeeded',
            completionTime: job.status.completionTime
              ? new Date(job.status.completionTime)
              : new Date(),
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
