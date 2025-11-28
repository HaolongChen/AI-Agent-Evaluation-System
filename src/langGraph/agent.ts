/**
 * LangGraph v1.0 Agent for AI Copilot Evaluation System
 *
 * This module implements the evaluation workflow using LangGraph JS v1.0 API.
 * It handles rubric generation and evaluation orchestration.
 */

import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { MemorySaver } from '@langchain/langgraph';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { ChatOpenAI, AzureChatOpenAI } from '@langchain/openai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  NODE_ENV,
  OPENAI_API_KEY,
  GEMINI_API_KEY,
  AZURE_OPENAI_ENDPOINT,
  AZURE_OPENAI_DEPLOYMENT,
  AZURE_OPENAI_API_VERSION,
  USES_AZURE_OPENAI,
  OPENAI_MODEL,
  GEMINI_MODEL,
  LLM_TEMPERATURE,
  LLM_MAX_OUTPUT_TOKENS,
  type LLMProvider,
} from '../config/env.ts';
import { logger } from '../utils/logger.ts';
import type { copilotType, expectedAnswerType } from '../utils/types.ts';
import { METRIC_CATEGORIES } from '../config/constants.ts';
import { copilotRubricPrompt } from '../langchain/prompts/copilotRubricPrompt.ts';
import {
  rubricParser,
  type RubricParserOutput,
} from '../langchain/parsers/rubricParser.ts';

// ============================================================================
// State Definition using LangGraph v1.0 Annotation API
// ============================================================================

/**
 * Rubric question structure for evaluation
 */
export interface RubricQuestion {
  content: string;
  rubricType: string;
  category: string;
  expectedAnswer: expectedAnswerType;
  rationale?: string | null;
}

/**
 * Audit trace entry for tracking workflow execution
 */
export interface AuditTraceEntry {
  timestamp: string;
  node: string;
  description: string;
}

/**
 * Array reducer that handles both single items and arrays
 * Used for annotation reducers in LangGraph state
 */
function arrayReducer<T>(existing: T[], update: T | T[]): T[] {
  if (Array.isArray(update)) {
    return [...existing, ...update];
  }
  return [...existing, update];
}

/**
 * State annotation for the evaluation graph using LangGraph v1.0 API
 */
const EvaluationStateAnnotation = Annotation.Root({
  // Input fields
  projectExId: Annotation<string>(),
  schemaExId: Annotation<string>(),
  copilotType: Annotation<copilotType>(),
  copilotInput: Annotation<string>(),
  copilotOutput: Annotation<string>(),
  idealResponse: Annotation<string | undefined>(),
  preferredProvider: Annotation<LLMProvider | undefined>(),

  // Conversation messages
  messages: Annotation<BaseMessage[]>({
    reducer: arrayReducer,
    default: () => [],
  }),

  // Generated rubrics
  rubricQuestions: Annotation<RubricQuestion[]>({
    reducer: arrayReducer,
    default: () => [],
  }),

  // Summary from rubric generation
  rubricSummary: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Metadata
  provider: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),
  model: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Error handling
  error: Annotation<string | null>({
    reducer: (_prev, next) => next,
    default: () => null,
  }),

  // Audit trail
  auditTrace: Annotation<AuditTraceEntry[]>({
    reducer: arrayReducer,
    default: () => [],
  }),

  // Workflow status
  status: Annotation<'pending' | 'running' | 'completed' | 'failed'>({
    reducer: (_prev, next) => next,
    default: () => 'pending',
  }),
});

// Type for the evaluation state
type EvaluationState = typeof EvaluationStateAnnotation.State;

// ============================================================================
// Helper Functions
// ============================================================================

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

const sanitizeSnippet = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().slice(0, 1_000);

const metricHintsAsText = (copilot: copilotType): string => {
  const hints = METRIC_HINT_MAP[copilot] || [];
  return hints.length
    ? hints.join(', ')
    : 'General quality, clarity, and correctness';
};

const formatIdealResponse = (idealResponse?: string): string => {
  if (idealResponse === undefined || idealResponse === null) {
    return 'Not provided';
  }
  return sanitizeSnippet(idealResponse);
};

const getFallbackCategory = (type: copilotType): string => {
  const hints = METRIC_HINT_MAP[type];
  return hints?.[0] ?? 'general_quality';
};

/**
 * Build LLM instance based on provider configuration
 */
function buildModel(provider: LLMProvider) {
  if (provider === 'openai') {
    if (USES_AZURE_OPENAI) {
      return new AzureChatOpenAI({
        temperature: LLM_TEMPERATURE,
        maxTokens: LLM_MAX_OUTPUT_TOKENS,
        azureOpenAIApiKey: OPENAI_API_KEY,
        azureOpenAIEndpoint: AZURE_OPENAI_ENDPOINT!,
        azureOpenAIApiDeploymentName: AZURE_OPENAI_DEPLOYMENT ?? OPENAI_MODEL,
        azureOpenAIApiVersion: AZURE_OPENAI_API_VERSION,
      });
    }

    return new ChatOpenAI({
      apiKey: OPENAI_API_KEY,
      temperature: LLM_TEMPERATURE,
      maxTokens: LLM_MAX_OUTPUT_TOKENS,
      model: OPENAI_MODEL,
    });
  }

  return new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL,
    temperature: LLM_TEMPERATURE,
    maxOutputTokens: LLM_MAX_OUTPUT_TOKENS,
  });
}

/**
 * Determine which LLM provider to use based on configuration
 */
function resolveProvider(preferred?: LLMProvider): LLMProvider | null {
  if (preferred) {
    const key = preferred === 'openai' ? OPENAI_API_KEY : GEMINI_API_KEY;
    if (key) return preferred;
  }

  if (OPENAI_API_KEY) return 'openai';
  if (GEMINI_API_KEY) return 'gemini';

  return null;
}

/**
 * Convert parsed rubric output to RubricQuestion array
 */
function toQuestions(
  payload: RubricParserOutput,
  fallbackCategory: string
): RubricQuestion[] {
  return payload.rubric.map((item) => ({
    content: item.question.trim(),
    rubricType: item.rubricType.trim() || 'general',
    category: item.category.trim() || fallbackCategory,
    expectedAnswer: item.expectedAnswer === 'no' ? 'no' : 'yes',
    rationale: item.rationale?.trim() ?? null,
  }));
}

/**
 * Create an audit trace entry
 */
function createAuditEntry(node: string, description: string): AuditTraceEntry {
  return {
    timestamp: new Date().toISOString(),
    node,
    description,
  };
}

// ============================================================================
// Node Functions
// ============================================================================

/**
 * Initialize node - validates input and sets up the workflow
 */
async function initializeNode(
  state: EvaluationState
): Promise<Partial<EvaluationState>> {
  logger.info('Initializing evaluation workflow', {
    projectExId: state.projectExId,
    schemaExId: state.schemaExId,
    copilotType: state.copilotType,
  });

  const auditEntry = createAuditEntry(
    'initialize',
    `Starting evaluation for ${state.copilotType} copilot`
  );

  return {
    status: 'running',
    auditTrace: [auditEntry],
    messages: [
      new HumanMessage(
        `Evaluating ${COPILOT_LABEL[state.copilotType]} output for schema ${state.schemaExId}`
      ),
    ],
  };
}

/**
 * Generate rubrics node - uses LLM to generate adaptive rubrics
 */
async function generateRubricsNode(
  state: EvaluationState
): Promise<Partial<EvaluationState>> {
  const provider = resolveProvider(state.preferredProvider);

  if (!provider) {
    logger.warn('No LLM provider configured');
    return {
      error: 'No LLM API key configured',
      status: 'failed',
      auditTrace: [
        createAuditEntry(
          'generateRubrics',
          'Failed: No LLM provider available'
        ),
      ],
    };
  }

  try {
    const model = buildModel(provider);
    const modelName =
      provider === 'openai'
        ? USES_AZURE_OPENAI
          ? AZURE_OPENAI_DEPLOYMENT
          : OPENAI_MODEL
        : GEMINI_MODEL;

    logger.info(`Generating rubrics using ${provider} (${modelName})`);

    // Build prompt with format instructions
    const promptWithFormat = await copilotRubricPrompt.partial({
      format_instructions: rubricParser.getFormatInstructions(),
    });

    // Create the chain
    const chain = promptWithFormat.pipe(model).pipe(rubricParser);

    // Prepare prompt variables
    const promptVariables = {
      projectExId: state.projectExId,
      schemaExId: state.schemaExId,
      copilotType: COPILOT_LABEL[state.copilotType] || state.copilotType,
      copilotInput: sanitizeSnippet(state.copilotInput),
      copilotOutput: sanitizeSnippet(state.copilotOutput),
      idealResponse: formatIdealResponse(state.idealResponse),
      metricHints: metricHintsAsText(state.copilotType),
    };

    // Invoke the chain
    const response: RubricParserOutput = await chain.invoke(promptVariables);
    const questions = toQuestions(
      response,
      getFallbackCategory(state.copilotType)
    );

    logger.info(`Generated ${questions.length} rubric questions`);

    return {
      rubricQuestions: questions,
      rubricSummary: response.summary ?? null,
      provider,
      model: modelName ?? null,
      messages: [
        new AIMessage(
          `Generated ${questions.length} rubric questions for evaluation`
        ),
      ],
      auditTrace: [
        createAuditEntry(
          'generateRubrics',
          `Generated ${questions.length} questions using ${provider}`
        ),
      ],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    logger.error(`Failed to generate rubrics: ${errorMessage}`);

    return {
      error: errorMessage,
      provider,
      auditTrace: [
        createAuditEntry('generateRubrics', `Error: ${errorMessage}`),
      ],
    };
  }
}

/**
 * Finalize node - marks the workflow as complete
 */
async function finalizeNode(
  state: EvaluationState
): Promise<Partial<EvaluationState>> {
  const hasQuestions = state.rubricQuestions.length > 0;
  const finalStatus = state.error
    ? 'failed'
    : hasQuestions
      ? 'completed'
      : 'failed';

  logger.info(`Finalizing evaluation workflow with status: ${finalStatus}`);

  return {
    status: finalStatus,
    auditTrace: [
      createAuditEntry(
        'finalize',
        `Workflow completed with status: ${finalStatus}, questions: ${state.rubricQuestions.length}`
      ),
    ],
  };
}

// ============================================================================
// Graph Construction
// ============================================================================

/**
 * Build the evaluation state graph using LangGraph v1.0 API
 */
function buildEvaluationGraph() {
  const workflow = new StateGraph(EvaluationStateAnnotation)
    .addNode('initialize', initializeNode)
    .addNode('generateRubrics', generateRubricsNode)
    .addNode('finalize', finalizeNode)
    .addEdge(START, 'initialize')
    .addEdge('initialize', 'generateRubrics')
    .addEdge('generateRubrics', 'finalize')
    .addEdge('finalize', END);

  return workflow;
}

// ============================================================================
// Checkpointer Configuration
// ============================================================================

/**
 * Create checkpointer based on environment
 * - Development: MemorySaver (in-memory, no persistence)
 * - Production: PostgresSaver (database-backed persistence)
 *
 * Note: PostgresSaver requires @langchain/langgraph-checkpoint-postgres package
 * and a configured DATABASE_URL environment variable.
 */
async function createCheckpointer() {
  if (NODE_ENV === 'development') {
    logger.info('Using MemorySaver checkpointer for development mode');
    return new MemorySaver();
  }

  // Production mode - use PostgresSaver for persistence
  // This requires the @langchain/langgraph-checkpoint-postgres package
  try {
    // Dynamic import to avoid issues if package is not installed
    const { PostgresSaver } = await import(
      '@langchain/langgraph-checkpoint-postgres'
    );

    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      logger.warn(
        'DATABASE_URL not configured for PostgresSaver, falling back to MemorySaver'
      );
      return new MemorySaver();
    }

    logger.info('Using PostgresSaver checkpointer for production mode');
    const checkpointer = PostgresSaver.fromConnString(connectionString);

    // Setup the checkpointer tables if they don't exist
    await checkpointer.setup();

    return checkpointer;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    logger.warn(
      `PostgresSaver not available, falling back to MemorySaver. ` +
        `To enable database persistence, install @langchain/langgraph-checkpoint-postgres: ` +
        `npm install @langchain/langgraph-checkpoint-postgres. Error: ${errorMessage}`
    );
    return new MemorySaver();
  }
}

// ============================================================================
// Agent Export
// ============================================================================

/**
 * Compiled agent graph with checkpointer
 * This is the main export for use with langgraph.json
 */
let compiledAgent: ReturnType<
  ReturnType<typeof buildEvaluationGraph>['compile']
> | null = null;

/**
 * Get or create the compiled agent with checkpointer
 */
export async function getAgent() {
  if (compiledAgent) {
    return compiledAgent;
  }

  const workflow = buildEvaluationGraph();
  const checkpointer = await createCheckpointer();

  compiledAgent = workflow.compile({
    checkpointer,
  });

  return compiledAgent;
}

/**
 * Export for langgraph.json configuration.
 *
 * NOTE: This synchronous export uses MemorySaver for compatibility with
 * langgraph.json which requires a synchronous export. For production use
 * with database persistence, use `getAgent()` instead which will use
 * PostgresSaver when NODE_ENV is 'production' and DATABASE_URL is configured.
 *
 * The langgraph CLI/server will use this export for local development and testing.
 * Production deployments should initialize the agent via `getAgent()` to get
 * the environment-appropriate checkpointer.
 */
export const agent = buildEvaluationGraph().compile({
  checkpointer: new MemorySaver(),
});

/**
 * Run an evaluation with the given input
 */
export async function runEvaluation(input: {
  projectExId: string;
  schemaExId: string;
  copilotType: copilotType;
  copilotInput: string;
  copilotOutput: string;
  idealResponse?: string;
  preferredProvider?: LLMProvider;
  threadId?: string;
}) {
  const agentInstance = await getAgent();

  const config = {
    configurable: {
      thread_id: input.threadId ?? `eval-${Date.now()}`,
    },
  };

  const result = await agentInstance.invoke(
    {
      projectExId: input.projectExId,
      schemaExId: input.schemaExId,
      copilotType: input.copilotType,
      copilotInput: input.copilotInput,
      copilotOutput: input.copilotOutput,
      idealResponse: input.idealResponse,
      preferredProvider: input.preferredProvider,
    },
    config
  );

  return {
    questions: result.rubricQuestions,
    summary: result.rubricSummary,
    metadata: {
      provider: result.provider,
      model: result.model,
      status: result.status,
      error: result.error,
    },
    auditTrace: result.auditTrace,
  };
}
