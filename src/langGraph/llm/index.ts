import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AzureChatOpenAI } from '@langchain/openai';
import { GeminiChatModel } from './GeminiChatModel.ts';
import {
  AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_ENDPOINT,
  GEMINI_API_KEY,
  OPENAI_API_KEY,
} from '../../config/env.ts';

export type LLMProvider = 'azure' | 'gemini';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature?: number;
}

type RetryOptions = {
  /** Total attempts = 1 + retries. */
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  operationName?: string;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const safeErrorText = (err: unknown): string => {
  try {
    if (err instanceof Error) return err.message;
    return typeof err === 'string' ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
};

const looksLikeOpenAIModelId = (value: string): boolean =>
  /^(gpt-|o\d|text-|chatgpt)/i.test(value);

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : null;

const getNested = (value: unknown, ...path: string[]): unknown => {
  let current: unknown = value;
  for (const key of path) {
    const rec = asRecord(current);
    if (!rec) return undefined;
    current = rec[key];
  }
  return current;
};

const isDeploymentNotFoundError = (err: unknown): boolean => {
  // LangChain errors sometimes include structured fields like:
  // { error: { code: 'DeploymentNotFound', message: ... }, lc_error_code: 'MODEL_NOT_FOUND' }
  const code =
    getNested(err, 'error', 'code') ??
    getNested(err, 'code') ??
    getNested(err, 'lc_error_code');
  if (code === 'DeploymentNotFound' || code === 'MODEL_NOT_FOUND') return true;

  const msg = safeErrorText(err);
  return (
    msg.includes('DeploymentNotFound') ||
    msg.includes('MODEL_NOT_FOUND') ||
    msg.includes('deployment for this resource does not exist')
  );
};

/**
 * Retry wrapper intended for transient Azure OpenAI deployment propagation delays.
 * NOTE: only retries when the error looks like DeploymentNotFound.
 */
export async function invokeWithRetry<T>(
  fn: () => Promise<T>,
  provider: LLMProvider,
  options: RetryOptions = {}
): Promise<T> {
  const retries = options.retries ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 5_000;
  const maxDelayMs = options.maxDelayMs ?? 20_000;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const shouldRetry =
        provider === 'azure' &&
        attempt < retries &&
        isDeploymentNotFoundError(err);
      if (!shouldRetry) throw err;

      const delay = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      // Avoid importing logger here to keep llm module dependency-light.
      console.warn(
        `[LangGraph][LLM] ${
          options.operationName ?? 'invoke'
        } failed with DeploymentNotFound; retrying in ${delay}ms (attempt ${
          attempt + 1
        }/${retries + 1})`
      );
      await sleep(delay);
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(safeErrorText(lastErr));
}

const normalizeAzureEndpoint = (endpoint: string): string => endpoint.trim();

const extractInstanceNameFromEndpoint = (endpoint: string): string | null => {
  try {
    const url = new URL(endpoint);
    const host = url.hostname; // e.g. functorz-sweden-central.openai.azure.com
    const prefix = host.split('.')[0];
    return prefix || null;
  } catch {
    return null;
  }
};

const resolveAzureDeploymentName = (requested: string): string => {
  const trimmed = (requested || '').trim();
  // Historical alias used elsewhere in the app; not a real Azure deployment name.
  if (AZURE_OPENAI_DEPLOYMENT && trimmed === 'copilot-latest') {
    return AZURE_OPENAI_DEPLOYMENT;
  }

  // If requested looks like a base model id (e.g. gpt-4o) and we have a configured
  // deployment name, prefer the configured deployment.
  if (AZURE_OPENAI_DEPLOYMENT && looksLikeOpenAIModelId(trimmed)) {
    return AZURE_OPENAI_DEPLOYMENT;
  }
  return trimmed || AZURE_OPENAI_DEPLOYMENT || trimmed;
};

export function getLLM(config: LLMConfig): BaseChatModel {
  switch (config.provider) {
    case 'azure': {
      const apiKey = OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set');
      }

      const deploymentName = resolveAzureDeploymentName(config.model);

      const endpoint = AZURE_OPENAI_ENDPOINT
        ? normalizeAzureEndpoint(AZURE_OPENAI_ENDPOINT)
        : undefined;

      // Backward-compatible: if endpoint isn't configured, fall back to instance name.
      // Prefer extracting instance name from endpoint if provided.
      const instanceName = endpoint
        ? extractInstanceNameFromEndpoint(endpoint)
        : process.env['AZURE_OPENAI_INSTANCE_NAME'] || null;

      if (!endpoint && !instanceName) {
        throw new Error(
          'Azure OpenAI is selected but AZURE_OPENAI_ENDPOINT (or AZURE_OPENAI_INSTANCE_NAME) is not set'
        );
      }

      return new AzureChatOpenAI({
        azureOpenAIApiKey: apiKey,
        ...(endpoint
          ? { azureOpenAIEndpoint: endpoint }
          : { azureOpenAIApiInstanceName: instanceName! }),
        azureOpenAIApiDeploymentName: deploymentName,
        azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
        temperature: config.temperature ?? 1,
      });
    }
    case 'gemini': {
      const apiKey = GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set');
      }
      return new GeminiChatModel({
        apiKey: apiKey,
        model: config.model,
        temperature: config.temperature ?? 0,
      });
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}
