import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { copilotRubricPrompt } from '../prompts/copilotRubricPrompt.ts';
import {
  rubricParser,
  type RubricParserOutput,
} from '../parsers/rubricParser.ts';
import {
  type LLMProvider,
  resolveLLMConfiguration,
  type LLMConfiguration,
  AZURE_OPENAI_API_VERSION,
  AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_ENDPOINT,
  USES_AZURE_OPENAI,
} from '../../config/env.ts';
import { METRIC_CATEGORIES } from '../../config/constants.ts';
import type { copilotType, expectedAnswerType } from '../../utils/types.ts';
import { logger } from '../../utils/logger.ts';

export interface CopilotRubricInput {
  projectExId: string;
  schemaExId: string;
  copilotType: copilotType;
  copilotInput: string;
  copilotOutput: string;
  idealResponse?: unknown;
  preferredProvider?: LLMProvider;
}

export interface RubricQuestion {
  content: string;
  rubricType: string;
  category: string;
  expectedAnswer: expectedAnswerType;
  rationale?: string | null;
}

export interface RubricGenerationMetadata {
  provider: string;
  model: string | null;
  fallbackUsed: boolean;
  reason?: string;
  rawOutput?: unknown;
}

export interface RubricGenerationResult {
  questions: RubricQuestion[];
  summary?: string | null;
  metadata: RubricGenerationMetadata;
}

const METRIC_HINT_MAP: Record<copilotType, readonly string[]> = {
  dataModel: METRIC_CATEGORIES.DATA_MODEL,
  uiBuilder: METRIC_CATEGORIES.UI_BUILDER,
  actionflow: METRIC_CATEGORIES.ACTIONFLOW,
  logAnalyzer: METRIC_CATEGORIES.LOG_ANALYZER,
  agentBuilder: METRIC_CATEGORIES.ACTIONFLOW,
};

const COPILOT_LABEL: Record<copilotType, string> = {
  dataModel: 'Data Model Builder',
  uiBuilder: 'UI Builder',
  actionflow: 'Actionflow Builder',
  logAnalyzer: 'Log Analyzer',
  agentBuilder: 'Agent Builder',
};

const FALLBACK_LIBRARY: Record<copilotType, RubricQuestion[]> = {
  dataModel: [
    {
      content:
        'Does the generated schema include every entity specifically mentioned in the instructions?',
      rubricType: 'completeness',
      category: 'entity_coverage',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Are the entity attributes aligned with the properties requested by the user (names, types, constraints)?',
      rubricType: 'correctness',
      category: 'attribute_completeness',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Does the schema enforce the relationships or keys required to satisfy the described business logic?',
      rubricType: 'integrity',
      category: 'relational_integrity',
      expectedAnswer: 'yes',
    },
  ],
  uiBuilder: [
    {
      content:
        'Does the UI layout feature all user-facing components that were requested in the prompt?',
      rubricType: 'coverage',
      category: 'component_choice_relevance',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Is the arrangement of components consistent and coherent with the described hierarchy or flow?',
      rubricType: 'structure',
      category: 'layout_coherence',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Does the styling or interaction model match the tone and responsive behavior specified by the user?',
      rubricType: 'style',
      category: 'style_adherence',
      expectedAnswer: 'yes',
    },
  ],
  actionflow: [
    {
      content:
        'Does the workflow include steps that fully cover each task called out in the instructions?',
      rubricType: 'coverage',
      category: 'task_adherence',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Are the conditional branches or guards logically correct so the workflow only runs when it should?',
      rubricType: 'logic',
      category: 'logical_correctness',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Is the workflow free of redundant steps and does it leverage efficient built-in actions where possible?',
      rubricType: 'efficiency',
      category: 'efficiency',
      expectedAnswer: 'yes',
    },
  ],
  logAnalyzer: [
    {
      content:
        'Does the analysis look at the correct log segments or signals referenced in the prompt?',
      rubricType: 'coverage',
      category: 'summary_completeness',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Does the explanation avoid hallucinations and stick to evidence present in the logs?',
      rubricType: 'faithfulness',
      category: 'faithfulness',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Does the response articulate likely root causes or actionable follow-ups for the anomalies described?',
      rubricType: 'root_cause',
      category: 'root_cause_correctness',
      expectedAnswer: 'yes',
    },
  ],
  agentBuilder: [
    {
      content:
        'Does the agent plan cover every high-level objective written in the request?',
      rubricType: 'coverage',
      category: 'task_adherence',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Are the agent tools or actions mapped to the correct triggers and context the user specified?',
      rubricType: 'tooling',
      category: 'logical_correctness',
      expectedAnswer: 'yes',
    },
    {
      content:
        'Does the agent design minimize risky or redundant steps to stay efficient?',
      rubricType: 'efficiency',
      category: 'efficiency',
      expectedAnswer: 'yes',
    },
  ],
};

const PROMPT_WITH_FORMAT = copilotRubricPrompt.partial({
  format_instructions: rubricParser.getFormatInstructions(),
});

const sanitizeSnippet = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().slice(0, 1_000);

const formatIdealResponse = (idealResponse?: unknown): string => {
  if (idealResponse === undefined || idealResponse === null) {
    return 'Not provided';
  }
  if (typeof idealResponse === 'string') {
    return sanitizeSnippet(idealResponse);
  }
  try {
    return sanitizeSnippet(JSON.stringify(idealResponse));
  } catch (error) {
    logger.warn('Failed to stringify ideal response', error);
    return 'Not provided';
  }
};

const metricHintsAsText = (copilot: copilotType): string => {
  const hints = METRIC_HINT_MAP[copilot] || [];
  return hints.length
    ? hints.join(', ')
    : 'General quality, clarity, and correctness';
};

const toQuestions = (
  payload: RubricParserOutput,
  fallbackCategory: string
): RubricQuestion[] =>
  payload.rubric.map((item) => ({
    content: item.question.trim(),
    rubricType: item.rubricType.trim() || 'general',
    category: item.category.trim() || fallbackCategory,
    expectedAnswer: item.expectedAnswer === 'no' ? 'no' : 'yes',
    rationale: item.rationale?.trim() ?? null,
  }));

const getFallbackCategory = (type: copilotType): string => {
  const hints = METRIC_HINT_MAP[type];
  return hints?.[0] ?? 'general_quality';
};

const buildModel = (config: LLMConfiguration) => {
  if (config.provider === 'openai') {
    if (USES_AZURE_OPENAI) {
      return new AzureChatOpenAI({
        temperature: config.temperature,
        maxTokens: config.maxOutputTokens,
        azureOpenAIApiKey: config.apiKey,
        azureOpenAIEndpoint: AZURE_OPENAI_ENDPOINT!,
        azureOpenAIApiDeploymentName: AZURE_OPENAI_DEPLOYMENT ?? config.model,
        azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
      });
    }

    return new ChatOpenAI({
      apiKey: config.apiKey,
      temperature: config.temperature,
      maxTokens: config.maxOutputTokens,
      model: config.model,
    });
  }
  return new ChatGoogleGenerativeAI({
    apiKey: config.apiKey,
    model: config.model,
    temperature: config.temperature,
    maxOutputTokens: config.maxOutputTokens,
  });
};

const buildFallbackResult = (
  copilot: copilotType,
  reason: string
): RubricGenerationResult => ({
  questions: FALLBACK_LIBRARY[copilot] ?? FALLBACK_LIBRARY.dataModel,
  summary: 'Fallback rubric generated without an LLM.',
  metadata: {
    provider: 'fallback',
    model: null,
    fallbackUsed: true,
    reason,
  },
});

export async function generateAdaptiveRubric(
  input: CopilotRubricInput
): Promise<RubricGenerationResult> {
  const promptVariables: Record<string, string> = {
    projectExId: input.projectExId,
    schemaExId: input.schemaExId,
    copilotType: COPILOT_LABEL[input.copilotType] || input.copilotType,
    copilotInput: sanitizeSnippet(input.copilotInput),
    copilotOutput: sanitizeSnippet(input.copilotOutput),
    idealResponse: formatIdealResponse(input.idealResponse),
    metricHints: metricHintsAsText(input.copilotType),
  };

  const gatherConfigurations = (
    preferred?: LLMProvider
  ): LLMConfiguration[] => {
    const seen = new Set<LLMProvider>();
    const configs: LLMConfiguration[] = [];
    const pushConfig = (config: LLMConfiguration | null) => {
      if (config && !seen.has(config.provider)) {
        seen.add(config.provider);
        configs.push(config);
      }
    };

    if (preferred) {
      pushConfig(resolveLLMConfiguration(preferred));
    }

    pushConfig(resolveLLMConfiguration());
    pushConfig(resolveLLMConfiguration('openai'));
    pushConfig(resolveLLMConfiguration('gemini'));

    return configs;
  };

  const candidates = gatherConfigurations(input.preferredProvider);

  if (!candidates.length) {
    logger.warn('No LLM provider configured; using fallback rubric');
    return buildFallbackResult(input.copilotType, 'No LLM API key configured');
  }

  const errors: Error[] = [];
  const prompt = await PROMPT_WITH_FORMAT;

  for (const config of candidates) {
    try {
      const model = buildModel(config);
      const chain = prompt.pipe(model).pipe(rubricParser);

      const response: RubricParserOutput = await chain.invoke(promptVariables);
      const questions = toQuestions(
        response,
        getFallbackCategory(input.copilotType)
      );

      return {
        questions,
        summary: response.summary ?? null,
        metadata: {
          provider: config.provider,
          model: config.model,
          fallbackUsed: false,
          rawOutput: response,
        },
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      errors.push(err);
      logger.error(
        `Failed to generate rubric via ${config.provider} (${config.model}):`,
        err
      );
    }
  }

  return buildFallbackResult(
    input.copilotType,
    `LLM generation failed: ${errors.map((e) => e.message).join(' | ')}`
  );
}
