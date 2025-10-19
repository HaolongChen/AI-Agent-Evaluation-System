export const COPILOT_TYPES = {
  DATA_MODEL_BUILDER: 'dataModel',
  UI_BUILDER: 'uiBuilder',
  ACTIONFLOW_BUILDER: 'actionflow',
  LOG_ANALYZER: 'logAnalyzer',
  AGENT_BUILDER: 'agentBuilder',
} as const;

export const SESSION_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const EVALUATION_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MODIFIED: 'modified',
} as const;

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
