import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { CopilotInputMessage } from "../schema/project.schema.ts";
import type { CrdtSchemaAggregate } from "../aggregate/crdt-schema.aggregate.ts";
import type { CrdtSchemaHandler } from "./crdt-schema-handler.ts";

export class CopilotExecutionService {
  constructor(
    private readonly copilotNetwork: ICopilotNetworkService,
    private readonly networkService: INetworkService,
    private readonly crdtSchemaHandler: CrdtSchemaHandler,
  ) {}

  async createSession(
    crdtSchema: CrdtSchemaAggregate,
    copilotInput: CopilotInputAggregate,
    account: Account,
  ) {
    const copilotSessionExId = await this.copilotNetwork.createCopilotSession(
      crdtSchema.getData("projectExId"),
      this.networkService.gqlClient(account.getEntity("networkClient")),
    );

    return new CopilotExecutionAggregate(
      crdtSchema,
      copilotSessionExId,
      copilotInput.getEntity("userInput").getData("content"),
    );
  }

  messageSenderConfiguration(
    copilotExecution: CopilotExecutionAggregate,
    account: Account,
  ) {
    return async <T extends keyof CopilotInputMessage>(
      type: T,
      message: CopilotInputMessage[T],
    ) =>
      this.copilotNetwork.sendMessageToSession(
        copilotExecution.getData("copilotSessionExId"),
        this.networkService.gqlClient(account.getEntity("networkClient")),
        type,
        message,
      );
  }

  toolCallHandlerConfiguration(
    copilotExecution: CopilotExecutionAggregate,
    account: Account,
  ) {
    return async (
      toolCalls: { name: string; args: unknown; toolCallId: string }[],
    ) =>
      this.copilotNetwork.runCopilotToolCalls(
        toolCalls,
        await this.crdtSchemaHandler.getSchemaGraph(
          copilotExecution.getEntity("crdtSchema"),
          this.networkService.gqlClient(account.getEntity("networkClient")),
        ),
      );
  }
}
