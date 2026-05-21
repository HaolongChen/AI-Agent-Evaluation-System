import type { Account } from "../../account/application/account-handler.ts";
import { TypeSystemStore } from "../infrastructure/crdt-schema-manager.ts";

export class GetSchemaIdUseCase {
  private typeSystemStore: TypeSystemStore | undefined;
  constructor(private account: Account) {}

  async execute(projectExId: string): Promise<string> {
    this.typeSystemStore = new TypeSystemStore(this.account, projectExId);
    await this.typeSystemStore.fetchAppDetailByExId();
    return this.typeSystemStore.getSchemaId();
  }
}
