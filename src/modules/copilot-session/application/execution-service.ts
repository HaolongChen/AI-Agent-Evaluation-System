import type { Account } from "../../account/application/account-handler.ts";
import { ExecutionJobRunnerV2 } from "./execution-job-v2.ts";
import { SessionOrchestrator } from "./session-orchestrator.ts";
import { createNewSession } from "../infrastructure/copilot-network.ts";
import { logger } from "../../shared/infrastructure/logger.ts";
import type { ICopilotInputRepository } from "../../dataset/domain/interface/copilot-input.interface.ts";
import { CopilotSessionAggregate } from "../domain/aggregate/copilot-session.aggregate.ts";
import type { ICopilotServerRepository } from "../../dataset/domain/interface/copilot-server.interface.ts";
import type { ICopilotSessionRepository } from "../domain/interface/copilot-session.interface.ts";
import type { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";

export class ExecuteCopilotUseCase {
	private isProjectTemporary = true;
	constructor(
		private repository: {
			copilotSessionRepository: ICopilotSessionRepository;
			copilotInputRepository: ICopilotInputRepository;
			copilotServerRepository: ICopilotServerRepository;
		},
		private account: Account,
	) {}

	async setupEnvironment(
		project: ProjectAggregate,
	): Promise<CopilotSessionAggregate> {
		const copilotSessionExId = await createNewSession(
			project.getData("projectExId"),
			await this.account.getGQLClient(),
		);
		const session = new CopilotSessionAggregate(project, copilotSessionExId);
		return session;
	}

	async executeV2(project: ProjectAggregate) {
		const copilotSession = await this.setupEnvironment(project);
		const copilotJobEntity = copilotSession.getEntity("copilotJob");
		const wsClient = await this.account.getWsClient();
		const gqlClient = await this.account.getGQLClient();
		try {
			const runner = new ExecutionJobRunnerV2(
				copilotJobEntity.getData("copilotSessionExId"),
				wsClient,
				gqlClient,
			);
			const orchestrator = new SessionOrchestrator(runner, copilotJobEntity);
			await orchestrator.run();
			await this.repository.copilotSessionRepository.save(copilotSession);
			return copilotSession.getEntity("copilotOutput").getData();
		} catch (error) {
			logger.error("Error setting up copilot execution environment:", error);
			this.account.clearWsClient();
			throw error;
		} finally {
			if (this.isProjectTemporary) {
				await this.projectLifecycle.deleteTemporaryProject();
			}
		}
	}
}
