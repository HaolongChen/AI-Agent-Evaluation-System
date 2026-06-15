export interface ICopilotRepository {
	save(
		id: string,
    data?: { editableText: string } | { aiResponse: string },
    task?: unknown,
	): Promise<void>;

	linkProject(
		projectId: string,
		copilotInputId: string,
		copilotServerId: string,
	): Promise<void>;
	linkCopilotSession(
		copilotSessionExId: string,
		projectId: string,
		id: string,
	): Promise<void>;
}
