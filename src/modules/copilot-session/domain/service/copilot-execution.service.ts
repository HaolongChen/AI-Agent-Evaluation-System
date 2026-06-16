import { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkAccount } from "../../../account/domain/service/account.service.ts";
import type { CopilotExecutionLogType } from "../schema/copilot-output.schema.ts";
import { CopilotInputEvent } from "../entity/copilot-job.entity.ts";

export class CopilotExecutionService {
	constructor(private readonly networkAccount: NetworkAccount) {}

	setupCopilotExecution(
		copilotInput: CopilotInputAggregate,
		copilotServer: CopilotServerEntity,
		account: Account,
	): CopilotExecutionAggregate {
		const projectNetwork =
      this.networkAccount.getDefaultNetworkClientForAccount( account );
    const copilotNetwork = this.networkAccount.getDefaultNetworkClientForAccount( account );
		return new CopilotExecutionAggregate(
			copilotInput,
      copilotServer,
      projectNetwork,
      copilotNetwork,
		);
  }

  executionLogFinalizationPolicy ( log: CopilotExecutionLogType ): boolean
  {
    if ( log.aiResponse && !log.editableText ) throw new Error( "incorrect order" );
    return !!( log.aiResponse && log.editableText );
  }

  responseToSend ( log: CopilotExecutionLogType ): CopilotInputEvent
  {
    if ( this.executionLogFinalizationPolicy( log ) )
    {
      return new CopilotInputEvent( "TERMINATE", { log, } );
    }
    if ( log.editableText )
    {
      return new CopilotInputEvent( "HUMAN_OPERATION", { log, humanOperationType: "CONTINUE" } );

    }
    return new CopilotInputEvent( "HUMAN_INPUT", { log, content: log.userInput } );
  }
}
