import { config } from 'dotenv';

config();

export const PORT = process.env['PORT'] || 4000;
export const NODE_ENV = process.env['NODE_ENV'] || 'development';
export const DATABASE_URL =
  process.env['DATABASE_URL'] || process.env['DATABASE_URL_DEVELOPMENT'];

export const URL = process.env['URL'] || `http://localhost:${PORT}`;
// Functorz backend GraphQL endpoint (NOT the copilot WebSocket service)
// This should be the main backend API that has queries like fetchAppDetailByExId
// Common endpoints: https://backend.functorz.com/graphql, https://api.functorz.com/graphql
export const BACKEND_GRAPHQL_URL =
  process.env['BACKEND_GRAPHQL_URL'] ||
  'https://zionbackend.functorz.work/api/graphql';

export const FUNCTORZ_PHONE_NUMBER = process.env['FUNCTORZ_PHONE_NUMBER'];
export const FUNCTORZ_PASSWORD = process.env['FUNCTORZ_PASSWORD'];

if (
  !process.env['WS_URL'] ||
  !process.env['userToken'] ||
  !process.env['projectExId']
) {
  throw new Error(
    'Missing required environment variables: WS_URL, userToken, or projectExId'
  );
}

export const RUN_KUBERNETES_JOBS =
  process.env['RUN_KUBERNETES_JOBS'] === 'true';

export const WS_URL =
  NODE_ENV === 'development'
    ? `${process.env['WS_URL']}userToken=${
        process.env['userToken']
      }&projectExId=${process.env['projectExId']}&clientType=${
        process.env['clientType'] || 'WEB'
      }`
    : `${process.env['WS_URL']}userToken=${
        process.env['userToken']
      }&projectExId=${process.env['projectExId']}&clientType=${
        process.env['clientType'] || 'WEB'
      }`; // TODO: modify WS_URL for production mode
export type LLMProvider = 'openai' | 'gemini';

export const OPENAI_API_KEY =
  process.env['OPENAI_API_KEY'] || process.env['AZURE_API_KEY'];
export const GEMINI_API_KEY = process.env['GOOGLE_API_KEY'];

export const AZURE_OPENAI_ENDPOINT = process.env['AZURE_OPENAI_ENDPOINT'];
export const AZURE_OPENAI_DEPLOYMENT = process.env['AZURE_OPENAI_DEPLOYMENT'];
export const AZURE_OPENAI_API_VERSION =
  process.env['AZURE_OPENAI_API_VERSION'] || '2025-04-01-preview';
export const USES_AZURE_OPENAI = Boolean(
  AZURE_OPENAI_ENDPOINT && AZURE_OPENAI_DEPLOYMENT && OPENAI_API_KEY
);

const RAW_LLM_PROVIDER = (process.env['LLM_PROVIDER'] || 'auto').toLowerCase();
export const LLM_PROVIDER: LLMProvider | 'auto' =
  RAW_LLM_PROVIDER === 'openai' || RAW_LLM_PROVIDER === 'gemini'
    ? (RAW_LLM_PROVIDER as LLMProvider)
    : 'auto';

export const OPENAI_MODEL = process.env['OPENAI_MODEL'] || 'gpt-4o-mini';
export const GEMINI_MODEL = process.env['GEMINI_MODEL'] || 'gemini-1.5-flash';
export const LLM_TEMPERATURE = parseFloat(
  process.env['LLM_TEMPERATURE'] || '0.2'
);
export const LLM_MAX_OUTPUT_TOKENS = parseInt(
  process.env['LLM_MAX_OUTPUT_TOKENS'] || '1024'
);

const PROVIDER_PRIORITY: LLMProvider[] = ['openai', 'gemini'];

const getProviderApiKey = (provider: LLMProvider): string | undefined =>
  provider === 'openai' ? OPENAI_API_KEY : GEMINI_API_KEY;

const getProviderModel = (provider: LLMProvider): string =>
  provider === 'openai'
    ? AZURE_OPENAI_DEPLOYMENT || OPENAI_MODEL
    : GEMINI_MODEL;

export interface LLMConfiguration {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxOutputTokens: number;
}

export const resolveLLMConfiguration = (
  preferredProvider?: LLMProvider
): LLMConfiguration | null => {
  const orderedProviders = preferredProvider
    ? [
        preferredProvider,
        ...PROVIDER_PRIORITY.filter((p) => p !== preferredProvider),
      ]
    : LLM_PROVIDER === 'auto'
    ? PROVIDER_PRIORITY
    : [LLM_PROVIDER, ...PROVIDER_PRIORITY.filter((p) => p !== LLM_PROVIDER)];

  for (const provider of orderedProviders) {
    const apiKey = getProviderApiKey(provider);
    if (apiKey) {
      return {
        provider,
        apiKey,
        model: getProviderModel(provider),
        temperature: LLM_TEMPERATURE,
        maxOutputTokens: LLM_MAX_OUTPUT_TOKENS,
      };
    }
  }

  return null;
};

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
