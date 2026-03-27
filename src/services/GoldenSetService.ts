import { prisma } from "../config/prisma.ts";
import { COPILOT_TYPES } from "../config/constants.ts";
import { logger } from "../utils/logger.ts";
import type {
	// Prisma,
	goldenSet,
	userInput,
	// copilotOutput,
	// evaluationSession,
} from "../prisma/build/generated/prisma/client.ts";
import type { GoldenSetFilters } from "../graphql/generated/resolvers-types.ts";
// import type { GoldenSet, GoldenSetFilters } from "../graphql/generated/resolvers-types.ts";

export class GoldenSetService {
	async getGoldenSetById(id: number): Promise<goldenSet | null> {
		try {
			const goldenSet = await prisma.goldenSet.findUnique({
				where: {
					id,
				},
			});
			return goldenSet;
		} catch (error) {
			logger.error("Error fetching golden set by ID:", error);
			throw new Error("Failed to fetch golden set by ID");
		}
	}

	async getGoldenSets(filters?: GoldenSetFilters): Promise<Array<goldenSet>> {
		try {
			const goldenSets = await prisma.goldenSet.findMany({
				where: {
					...(filters?.schemaId && { schemaId: filters.schemaId }),
					...(filters?.copilotType && {
						copilotType: COPILOT_TYPES[filters.copilotType],
					}),
					...(filters?.modelName && { modelName: filters.modelName }),
				},
				// orderBy: { createdAt: "desc" },
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
			const userInput = await prisma.userInput.create({
				data: {
					description,
					content,
					createdBy,
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
		copilotType: keyof typeof COPILOT_TYPES,
		modelName: string,
	): Promise<goldenSet> {
		try {
			const copilotTypeValue = COPILOT_TYPES[copilotType];
			const goldenSet = await prisma.goldenSet.create({
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
		goldenSetId: number,
		userInputId: number,
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
			logger.error("Error linking golden set to user input:", error);
			throw new Error("Failed to link golden set to user input");
		}
	}

	// async updateGoldenSetInputX(
	// 	schemaId: string,
	// 	copilotType: keyof typeof COPILOT_TYPES,
	// 	description: string,
	// 	query: string,
	// ): Promise<GoldenSetWithRelations> {
	// 	try {
	// 		const copilotTypeValue = COPILOT_TYPES[copilotType];
	// 		const goldenSet = await prisma.goldenSet.upsert({
	// 			where: {
	// 				schemaExId,
	// 			},
	// 			update: {
	// 				userInput: {
	// 					create: {
	// 						description,
	// 						content: query,
	// 					},
	// 				},
	// 			},
	// 			create: {
	// 				schemaExId,
	// 				copilotType: copilotTypeValue,
	// 				userInput: {
	// 					create: {
	// 						description,
	// 						content: query,
	// 					},
	// 				},
	// 				isProjectExisting: schemaExId !== "N/A", // Mark as existing if schemaExId is provided, otherwise it's a new golden set
	// 			},
	// 			include: {
	// 				userInput: true,
	// 				copilotOutput: true,
	// 			},
	// 		});
	// 		logger.debug("Upserted golden set project:", goldenSet);
	// 		return goldenSet;
	// 	} catch (error) {
	// 		logger.error("Error updating golden set project:", error);
	// 		throw new Error("Failed to update golden set project");
	// 	}
	// }

	// async updateGoldenSetOutputAndInitSessionX(
	// 	goldenSetId: number,
	// 	output: string,
	// 	duration: number,
	// 	modelName: string,
	// 	status: "pending" | "running" | "completed" | "failed",
	// 	metadata: Prisma.InputJsonValue,
	// ): Promise<GoldenSetWithRelations> {
	// 	try {
	// 		const goldenSet = await prisma.goldenSet.update({
	// 			where: {
	// 				id: goldenSetId,
	// 			},
	// 			data: {
	// 				copilotOutput: {
	// 					create: {
	// 						content: output,
	// 						totalLatencyMs: duration,
	// 					},
	// 				},
	// 				evaluationSessions: {
	// 					create: {
	// 						modelName,
	// 						status,
	// 						metadata,
	// 					},
	// 				},
	// 			},
	// 			include: {
	// 				userInput: true,
	// 				copilotOutput: true,
	// 				evaluationSessions: true,
	// 			},
	// 		});

	// 		logger.debug("Upserted golden set project:", goldenSet);
	// 		return goldenSet;
	// 	} catch (error) {
	// 		logger.error("Error updating golden set project:", error);
	// 		throw new Error("Failed to update golden set project");
	// 	}
	// }

	// async getGoldenSetById(id: number): Promise<GoldenSet | null> {
	// 	try {
	// 		const goldenSet = await prisma.goldenSet.findUnique({
	// 			where: {
	// 				id
	// 			},
	// 		});
	// 		return goldenSet ? null : goldenSet; // Transform to match GraphQL type if needed
	// 	} catch (error) {
	// 		logger.error("Error fetching golden sets:", error);
	// 		throw new Error("Failed to fetch golden sets");
	// 	}
	// }

	// async getGoldenSets(
	// 	filters: GoldenSetFilters,
	// ): Promise<Array<goldenSet>> {
	// 	try {
	// 		const goldenSets = await prisma.goldenSet.findMany({
	// 			where: {
	// 				...(filters?.schemaExId && { schemaExId: filters.schemaExId }),
	// 				...(filters?.copilotType && {
	// 					copilotType: COPILOT_TYPES[filters.copilotType],
	// 				}),
	// 				...(filters?.modelName && { modelName: filters.modelName }),
	// 			},
	// 			// orderBy: { createdAt: "desc" },
	// 		});

	// 		logger.debug("Fetched golden sets:", goldenSets);
	// 		return goldenSets;
	// 	} catch (error) {
	// 		logger.error("Error fetching golden sets:", error);
	// 		throw new Error("Failed to fetch golden sets");
	// 	}
	// }
}

export const goldenSetService = new GoldenSetService();
