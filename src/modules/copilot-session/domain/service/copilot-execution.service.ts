import type { ICopilotNetworkService } from "../interface/copilot-network.interface.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { INetworkService } from "../../../account/domain/interface/network-service.interface.ts";
import type { CopilotInputMessage } from "../schema/project.schema.ts";
import type { CrdtSchemaHandler } from "./crdt-schema-handler.ts";
import type { ProjectAggregate } from "../aggregate/project.aggregate.ts";
import type { AccountEntity } from "../../../account/domain/entity/account.entity.ts";
import { NetworkClientEntity } from "../../../account/domain/entity/network-client.entity.ts";

export class CopilotExecutionService {
  constructor(
    private readonly copilotNetwork: ICopilotNetworkService,
    private readonly networkService: INetworkService,
    private readonly crdtSchemaHandler: CrdtSchemaHandler,
  ) {}

  configureCopilotNetwork ( account: AccountEntity, copilotExecutionAggregate: CopilotExecutionAggregate ): Account
  {
    const networkClient = new NetworkClientEntity( { wsUrl: copilotExecutionAggregate.getData( "wsUrl" ), gqlUrl: copilotExecutionAggregate.getData( "gqlUrl" ) } );
    return new Account( account, networkClient );
  }

  async start(
    project: ProjectAggregate,
    copilotInput: CopilotInputAggregate,
    account: Account,
  ): Promise<CopilotExecutionAggregate> {
    const crdtSchema = await this.crdtSchemaHandler.rehydrate(
      project,
      this.networkService.gqlClient(account.getEntity("networkClient")),
    );
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

  sender(
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

  toolCallHandler(
    copilotExecution: CopilotExecutionAggregate,
    account: Account,
  ) {
    return async (
      toolCalls: { name: string; args: unknown; toolCallId: string }[],
    ) => {
      return this.copilotNetwork.runCopilotToolCalls(
        toolCalls,
        await this.crdtSchemaHandler.getSchemaGraph(
          copilotExecution.getEntity("crdtSchema"),
          this.networkService.gqlClient(account.getEntity("networkClient")),
        ),
      );
    };
  }
}
