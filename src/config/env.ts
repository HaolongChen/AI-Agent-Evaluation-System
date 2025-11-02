import { config } from 'dotenv';

config();

export const PORT = process.env['PORT'] || 4000;
export const NODE_ENV = process.env['NODE_ENV'] || 'development';
export const DATABASE_URL =
  process.env['DATABASE_URL'] || process.env['DATABASE_URL_DEVELOPMENT'];

export const URL = process.env['URL'] || `http://localhost:${PORT}`;
if (
  !process.env['WS_URL'] ||
  !process.env['userToken'] ||
  !process.env['projectExId']
) {
  throw new Error(
    'Missing required environment variables: WS_URL, userToken, or projectExId'
  );
}

export const RUN_KUBERNETES_JOBS = process.env['RUN_KUBERNETES_JOBS'] === 'true';

export const WS_URL =
  NODE_ENV === 'development'
    ? `${process.env['WS_URL']}userToken=${process.env['userToken']}&projectExId=${process.env['projectExId']}`
    : `${process.env['WS_URL']}userToken=${process.env['userToken']}&projectExId=${process.env['projectExId']}`; // TODO: modify WS_URL for production mode
// // LLM Configuration
// export const OPENAI_API_KEY = process.env['OPENAI_API_KEY'];
// export const ANTHROPIC_API_KEY = process.env['ANTHROPIC_API_KEY'];
// export const LLM_PROVIDER = process.env['LLM_PROVIDER'] || 'openai';
// export const LLM_MODEL = process.env['LLM_MODEL'] || 'gpt-4';
// export const LLM_TEMPERATURE = parseFloat(
//   process.env['LLM_TEMPERATURE'] || '0.7'
// );
// export const LLM_MAX_TOKENS = parseInt(process.env['LLM_MAX_TOKENS'] || '2000');

// // Kubernetes Configuration
// export const KUBERNETES_NAMESPACE =
//   process.env['KUBERNETES_NAMESPACE'] || 'ai-evaluation';
// export const KUBERNETES_JOB_IMAGE = process.env['KUBERNETES_JOB_IMAGE'] || '';
// export const KUBERNETES_JOB_CPU_REQUEST =
//   process.env['KUBERNETES_JOB_CPU_REQUEST'] || '500m';
// export const KUBERNETES_JOB_MEMORY_REQUEST =
//   process.env['KUBERNETES_JOB_MEMORY_REQUEST'] || '1Gi';
// export const KUBERNETES_JOB_CPU_LIMIT =
//   process.env['KUBERNETES_JOB_CPU_LIMIT'] || '2000m';
// export const KUBERNETES_JOB_MEMORY_LIMIT =
//   process.env['KUBERNETES_JOB_MEMORY_LIMIT'] || '4Gi';
// export const KUBERNETES_JOB_BACKOFF_LIMIT = parseInt(
//   process.env['KUBERNETES_JOB_BACKOFF_LIMIT'] || '3'
// );
// export const KUBERNETES_JOB_ACTIVE_DEADLINE_SECONDS = parseInt(
//   process.env['KUBERNETES_JOB_ACTIVE_DEADLINE_SECONDS'] || '3600'
// );
