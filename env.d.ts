declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL_PRODUCTION: string;
      DATABASE_URL_DEVELOPMENT: string;
      TEST_DB_URL: string;
      NODE_ENV: string;
      PORT: string;
      GOOGLE_API_KEY: string;
      AZURE_API_KEY: string;
      TEST_DB_URL: string;
      WS_URL: string;
      userToken: string;
      projectExId: string;
      ALIYUN_OSS_BUCKET: string;
      ALIYUN_ACCESS_KEY: string;
      ALIYUN_ACCESS_SECRET: string;
      RUN_KUBERNETES_JOBS: string;
      BACKEND_GRAPHQL_URL: string;
      SUBSCRIPTION_GRAPHQL_URL: string;
      MOMEN_DOCS_URL: string;
      FUNCTORZ_PHONE_NUMBER: string;
      FUNCTORZ_PASSWORD: string;
      ORGANIZATION_EX_ID: string;
      LLM_PROVIDER: string;
      OPENAI_MODEL: string;
      GEMINI_MODEL: string;
      LLM_TEMPERATURE: string;
      LLM_MAX_OUTPUT_TOKENS: string;
      clientType: string;
      AZURE_OPENAI_ENDPOINT: string;
      AZURE_OPENAI_DEPLOYMENT: string;
      AZURE_OPENAI_API_VERSION: string;
      LANGSMITH_TRACING: string;
      LANGSMITH_ENDPOINT: string;
      LANGSMITH_API_KEY: string;
      LANGSMITH_PROJECT: string;
    }
  }
}

export {}
