export const COPILOT_TYPES = {
  DATA_MODEL_BUILDER: 'dataModel',
  UI_BUILDER: 'uiBuilder',
  ACTIONFLOW_BUILDER: 'actionflow',
  LOG_ANALYZER: 'logAnalyzer',
  AGENT_BUILDER: 'agentBuilder',
} as const;

export const REVERSE_COPILOT_TYPES: {
  [key: string]: keyof typeof COPILOT_TYPES;
} = {
  dataModel: 'DATA_MODEL_BUILDER',
  uiBuilder: 'UI_BUILDER',
  actionflow: 'ACTIONFLOW_BUILDER',
  logAnalyzer: 'LOG_ANALYZER',
  agentBuilder: 'AGENT_BUILDER',
};

export const SESSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const REVERSE_SESSION_STATUS: { [key: string]: string } = {
  pending: 'PENDING',
  running: 'RUNNING',
  completed: 'COMPLETED',
  failed: 'FAILED',
};

export const EVALUATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const REVERSE_EVALUATION_STATUS: { [key: string]: string } = {
  pending: 'PENDING',
  in_progress: 'IN_PROGRESS',
  completed: 'COMPLETED',
  failed: 'FAILED',
};

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MODIFIED: 'modified',
} as const;

export const REVERSE_REVIEW_STATUS: { [key: string]: string } = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  modified: 'MODIFIED',
};

export const METRIC_CATEGORIES = {
  DATA_MODEL: [
    'entity_coverage',
    'attribute_completeness',
    'naming_convention_adherence',
    'relational_integrity',
    'normalization_level',
  ],
  UI_BUILDER: [
    'component_choice_relevance',
    'layout_coherence',
    'style_adherence',
    'responsiveness_check',
  ],
  ACTIONFLOW: ['task_adherence', 'logical_correctness', 'efficiency'],
  LOG_ANALYZER: [
    'faithfulness',
    'root_cause_correctness',
    'summary_completeness',
  ],
} as const;

export const CALL_GRAPHQL = {
  QUERY: {
    GET_GOLDEN_SET_SCHEMAS: `
    query GetGoldenSetSchemas {
      getGoldenSetSchemas(copilotType: $copilotType) 
    }
    `,
    GET_GOLDEN_SETS: `
    query GetGoldenSets {
      getGoldenSets(projectExId: $projectExId, copilotType: $copilotType) {
        id
        projectExId
        schemaExId
        copilotType
        description
        promptTemplate
        idealResponse
        createdAt
        createdBy
        isActive
      }
    }
    `,
    GET_SESSION: `
    query GetSession {
      getSession(id: $id) {
        id
        projectExId
        schemaExId
        copilotType
        modelName
        sessionIdRef
        startedAt
        completedAt
        status
        totalLatencyMs
        roundtripCount
        inputTokens
        outputTokens
        totalTokens
        contextPercentage
      }
    }
    `,
    GET_SESSIONS: `
    query GetSessions {
      getSessions(schemaExId: $schemaExId, copilotType: $copilotType, modelName: $modelName) {
        id
        projectExId
        schemaExId
        copilotType
        modelName
        sessionIdRef
        startedAt
        completedAt
        status
        totalLatencyMs
        roundtripCount
        inputTokens
        outputTokens
        totalTokens
        contextPercentage
      }
    }
    `,
  },
};
