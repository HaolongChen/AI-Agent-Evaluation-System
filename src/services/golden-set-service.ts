import { prisma } from "../config/prisma.ts";

import type {
	GoldenSetFilters,
	CopilotType,
} from "../graphql/generated/resolvers-types.ts";
import type {
	goldenSet,
	userInput,
} from "../prisma/build/generated/prisma/client.ts";
import type { CopilotType as PrismaCopilotType } from "../prisma/build/generated/prisma/enums.ts";

const toPrismaCopilotType = (copilotType: CopilotType): PrismaCopilotType => {
	switch (copilotType) {
		case "DATA_MODEL_BUILDER": {
			return "dataModelBuilder";
		}
		case "UI_BUILDER": {
			return "uiBuilder";
		}
		case "ACTION_FLOW_BUILDER": {
			return "actionFlowBuilder";
		}
		case "LOG_ANALYZER": {
			return "logAnalyzer";
		}
		case "AGENT_BUILDER": {
			return "agentBuilder";
		}
	}

	throw new Error(`Unsupported copilot type: ${copilotType}`);
};

export class GoldenSetService {
	async getGoldenSetById(id: string): Promise<goldenSet> {
		try {
			const goldenSet = await prisma.goldenSet.findUnique({
				where: { id },
			} )
			if (!goldenSet) {
				throw new Error(`Golden set with ID ${id} not found`);
			}
			return goldenSet;
		} catch (error) {
			console.error("Error fetching golden set by ID:", error);
			throw new Error("Failed to fetch golden set by ID");
		}
	}

	async getGoldenSets(filters?: GoldenSetFilters): Promise<Array<goldenSet>> {
		try {
			const copilotType =
				filters?.copilotType ?
					toPrismaCopilotType(filters.copilotType)
				:	undefined;
			const goldenSets = await prisma.goldenSet.findMany({
				where: {
					...(filters?.schemaId && { schemaId: filters.schemaId }),
					...(copilotType && { copilotType }),
					...(filters?.modelName && { modelName: filters.modelName }),
				},
			});
			return goldenSets;
		} catch (error) {
			console.error("Error fetching golden sets:", error);
			throw new Error("Failed to fetch golden sets");
		}
	}

	async createUserInput(
		description: string,
		content: string,
		createdBy: string,
	): Promise<userInput> {
		try {
			const userInput = await prisma.userInput.create({
				data: {
					description: description,
					content,
					createdBy: createdBy,
				},
			});
			return userInput;
		} catch (error) {
			console.error("Error creating user input:", error);
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
			const goldenSet = await prisma.goldenSet.create({
				data: {
					schemaId,
					copilotType: copilotTypeValue,
					modelName,
				},
			});
			return goldenSet;
		} catch (error) {
			console.error("Error creating golden set:", error);
			throw new Error("Failed to create golden set");
		}
	}

	async linkGoldenSetToUserInput(
		goldenSetId: string,
		userInputId: string,
	): Promise<goldenSet> {
		try {
			const goldenSet = await prisma.goldenSet.update({
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
			console.error("Error linking golden set to user input:", error);
			throw new Error("Failed to link golden set to user input");
		}
	}
}

export const goldenSetService = new GoldenSetService();
