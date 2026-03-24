import 'dotenv/config';

export const PORT = process.env['PORT'] || 4000;
export const NODE_ENV = process.env['NODE_ENV'] || 'development';
export const DATABASE_URL =
  process.env['DATABASE_URL'] || process.env['DATABASE_URL_DEVELOPMENT'];

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is required but is not set in the environment');
}

export const URL = process.env['URL'] || `http://localhost:${PORT}`;
// Functorz backend GraphQL endpoint (NOT the copilot WebSocket service)
// This should be the main backend API that has queries like fetchAppDetailByExId
// Common endpoints: https://backend.functorz.com/graphql, https://api.functorz.com/graphql
export const BACKEND_GRAPHQL_URL =
  process.env['BACKEND_GRAPHQL_URL'] ||
  'https://zionbackend.functorz.work/api/graphql';
export const SUBSCRIPTION_GRAPHQL_URL =
  process.env['SUBSCRIPTION_GRAPHQL_URL'] ||
  'wss://zionbackend.functorz.work/api/graphql-subscription';

export const ORGANIZATION_EX_ID =
  process.env['ORGANIZATION_EX_ID'] || '';


export const MOMEN_DOCS_URL = process.env['MOMEN_DOCS_URL'] || 'https://docs.momen.app';

export const ALIYUN_OSS_BUCKET = process.env['ALIYUN_OSS_BUCKET'] || '';
export const ALIYUN_ACCESS_KEY = process.env['ALIYUN_ACCESS_KEY'] || '';
export const ALIYUN_ACCESS_SECRET = process.env['ALIYUN_ACCESS_SECRET'] || '';

export const FUNCTORZ_PHONE_NUMBER = process.env['FUNCTORZ_PHONE_NUMBER'];
export const FUNCTORZ_PASSWORD = process.env['FUNCTORZ_PASSWORD'];

if (
  !process.env['WS_URL'] ||
  !process.env['userToken']
) {
  throw new Error(
    'Missing required environment variables: WS_URL or userToken'
  );
}


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

export const buildWsUrl = (projectExId: string): string =>
  `${process.env['WS_URL']}userToken=${
    process.env['userToken']
  }&projectExId=${projectExId}&clientType=${
    process.env['clientType'] || 'WEB'
  }`;

export const OSS_URL = (schemaId: string): string =>
  `oss://${ALIYUN_OSS_BUCKET}/schema/${schemaId}`;

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

export const OPENAI_MODEL = process.env['OPENAI_MODEL'] || 'gpt-5-mini';
export const GEMINI_MODEL = process.env['GEMINI_MODEL'] || 'gemini-3-flash-preview';
const _temp = parseFloat(process.env['LLM_TEMPERATURE'] || '0.2');
export const LLM_TEMPERATURE = Number.isFinite(_temp) ? _temp : 0.2;
const _tokens = parseInt(process.env['LLM_MAX_OUTPUT_TOKENS'] || '1024', 10);
export const LLM_MAX_OUTPUT_TOKENS = Number.isFinite(_tokens) ? _tokens : 1024;

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

