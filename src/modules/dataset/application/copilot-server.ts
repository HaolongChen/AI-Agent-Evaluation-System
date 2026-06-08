import type { ICopilotServerRepository } from "../domain/interface/copilot-server.interface.ts";

export class GetCopilotServerUseCase {
	constructor(private repository: ICopilotServerRepository) {}

	async execute() {
		return await this.repository.getDefault();
	}
}
