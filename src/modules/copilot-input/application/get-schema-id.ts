import type { TypeSystemStore } from "../infrastructure/type-system-store.ts";

export class GetSchemaIdUseCase {
  constructor(private readonly typeSystemStore: TypeSystemStore) {}

  async execute(projectExId: string): Promise<string> {
    const appDetail =
      await this.typeSystemStore.fetchAppDetailByExId(projectExId);
    if (appDetail.crdtModelUrl)
      return this.typeSystemStore.getSchemaIdFromCrdtModelUrl(
        appDetail.crdtModelUrl,
      );
    throw new Error(`No valid schema ID found for projectExId: ${projectExId}`);
  }
}
