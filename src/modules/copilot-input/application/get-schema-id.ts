import type { TypeSystemStore } from "../infrastructure/type-system-store.ts";

export class GetSchemaIdUseCase {
  constructor(private readonly typeSystemStore: TypeSystemStore) {}

  async execute(projectExId: string): Promise<string> {
    await this.typeSystemStore.fetchAppDetailByExId(projectExId);
    return this.typeSystemStore.getSchemaId();
  }
}
