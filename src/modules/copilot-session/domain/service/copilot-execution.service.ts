import { CopilotExecutionAggregate } from "../aggregate/copilot-execution.aggregate.ts";
import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";

export class CopilotExecutionService {
  copilotNetwork(
    copilotExecutionAggregate: CopilotExecutionAggregate,
  ): NetworkClient {
    return new NetworkClient({
      wsUrl: copilotExecutionAggregate.getData("wsUrl"),
      gqlUrl: copilotExecutionAggregate.getData("gqlUrl"),
    });
  }
}
