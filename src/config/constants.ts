import type { CopilotType } from "../prisma/build/generated/prisma/enums.ts";

export const COPILOT_TYPES = {
	DATA_MODEL_BUILDER: "dataModelBuilder",
	UI_BUILDER: "uiBuilder",
	ACTION_FLOW_BUILDER: "actionFlowBuilder",
	LOG_ANALYZER: "logAnalyzer",
	AGENT_BUILDER: "agentBuilder",
} as const;

export const REVERSE_COPILOT_TYPES: Record<
	CopilotType,
	keyof typeof COPILOT_TYPES
> = {
	dataModelBuilder: "DATA_MODEL_BUILDER",
	uiBuilder: "UI_BUILDER",
	actionFlowBuilder: "ACTION_FLOW_BUILDER",
	logAnalyzer: "LOG_ANALYZER",
	agentBuilder: "AGENT_BUILDER",
};

export const EVALUATOR = {
	HUMAN: "human",
	AGENT: "agent",
} as const;

export const REVERSE_EVALUATOR: { [key: string]: string } = {
	human: "HUMAN",
	agent: "AGENT",
};


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
        copilotType
        description
        query
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
      getSessions(projectExId: $projectExId, copilotType: $copilotType, modelName: $modelName) {
        id
        projectExId
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
