import { logger } from "../external/logger.ts";
import type {
	GoldenSetFilters,
	CopilotType,
} from "../graphql/generated/resolvers-types.ts";
import type {
	goldenSet,
	userInput,
} from "../prisma/build/generated/prisma/client.ts";
import type { CopilotType as PrismaCopilotType } from "../prisma/build/generated/prisma/enums.ts";
import { GoldenSetInterface } from "@src/interface/goldenSetInterface";
import { UserInputInterface } from "@src/interface/userInputInterface";

const toPrismaCopilotType = (copilotType: CopilotType): PrismaCopilotType => {
	switch (copilotType) {
		case "DATA_MODEL_BUILDER":
			return "dataModelBuilder";
		case "UI_BUILDER":
			return "uiBuilder";
		case "ACTION_FLOW_BUILDER":
			return "actionFlowBuilder";
		case "LOG_ANALYZER":
			return "logAnalyzer";
		case "AGENT_BUILDER":
			return "agentBuilder";
	}

	throw new Error(`Unsupported copilot type: ${copilotType}`);
};

export class GoldenSetService {
	async getGoldenSetById(id: string): Promise<goldenSet | null> {
		try {
			const goldenSetInterface = new GoldenSetInterface("findUnique");
			const goldenSet = await goldenSetInterface.getGoldenSetAdapter({
				where: { id },
			});
			return goldenSet;
		} catch (error) {
			logger.error("Error fetching golden set by ID:", error);
			throw new Error("Failed to fetch golden set by ID");
		}
	}

	async getGoldenSets(filters?: GoldenSetFilters): Promise<Array<goldenSet>> {
		try {
			const copilotType =
				filters?.copilotType ?
					toPrismaCopilotType(filters.copilotType)
				:	undefined;
			const goldenSetInterface = new GoldenSetInterface("findMany");
			const goldenSets = await goldenSetInterface.getGoldenSetAdapter({
				where: {
					...(filters?.schemaId && { schemaId: filters.schemaId }),
					...(copilotType && { copilotType }),
					...(filters?.modelName && { modelName: filters.modelName }),
				},
			});
			return goldenSets;
		} catch (error) {
			logger.error("Error fetching golden sets:", error);
			throw new Error("Failed to fetch golden sets");
		}
	}

	async createUserInput(
		description: string,
		content: string,
		createdBy: string,
	): Promise<userInput> {
		try {
			const userInputInterface = new UserInputInterface("create");
			const userInput = await userInputInterface.getUserInputAdapter({
				data: {
					description: description || null,
					content,
					createdBy: createdBy || null,
				},
			});
			return userInput;
		} catch (error) {
			logger.error("Error creating user input:", error);
			throw new Error("Failed to create user input");
		}
	}

	async createGoldenSet(
		schemaId: string,
		copilotType: CopilotType,
		modelName: string,
	): Promise<goldenSet> {
		try {
			const copilotTypeValue = toPrismaCopilotType(copilotType);
			const goldenSetInterface = new GoldenSetInterface("create");
			const goldenSet = await goldenSetInterface.getGoldenSetAdapter({
				data: {
					schemaId,
					copilotType: copilotTypeValue,
					modelName,
				},
			});
			return goldenSet;
		} catch (error) {
			logger.error("Error creating golden set:", error);
			throw new Error("Failed to create golden set");
		}
	}

	async linkGoldenSetToUserInput(
		goldenSetId: string,
		userInputId: string,
	): Promise<goldenSet> {
		try {
			const goldenSetInterface = new GoldenSetInterface("update");
			const goldenSet = await goldenSetInterface.getGoldenSetAdapter({
				where: { id: goldenSetId },
				data: {
					userInputs: {
						connect: { id: userInputId },
					},
				},
				include: {
					userInputs: true,
				},
			});
			return goldenSet;
		} catch (error) {
			logger.error("Error linking golden set to user input:", error);
			throw new Error("Failed to link golden set to user input");
		}
	}
}

export const goldenSetService = new GoldenSetService();
