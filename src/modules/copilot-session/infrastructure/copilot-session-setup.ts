import { z } from "zod";
import type {
  CreateCopilotSessionMutation,
  CreateCopilotSessionMutationVariables,
  GetCopilotSubscriptionCountQuery,
  GetCopilotSubscriptionCountQueryVariables,
  GetLatestSessionMutation,
  GetLatestSessionMutationVariables,
} from "../../../graphql/generated/types.ts";
import type { ICopilotSessionSetup } from "../domain/interface/copilot-session-setup.interface.ts";
import {
  CREATE_COPILOT_SESSION,
  GET_COPILOT_SUBSCRIPTION_COUNT,
  GET_LATEST_SESSION,
} from "./copilot-network.ts";
import type { OnlineAccount } from "../../account/domain/service/online-account.service.ts";
import type { ProjectEntity } from "../domain/entity/project.entity.ts";

export class CopilotSessionSetup implements ICopilotSessionSetup {
  constructor(private account: OnlineAccount) {}

  async createNewSession(project: ProjectEntity): Promise<string> {
    const result = await this.account.gqlClient.gqlRequest<
      CreateCopilotSessionMutation,
      CreateCopilotSessionMutationVariables
    >(CREATE_COPILOT_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return result.createCopilotSession;
  }
  async getLatestSession(project: ProjectEntity): Promise<string | null> {
    const latestSessionResult = await this.account.gqlClient.gqlRequest<
      GetLatestSessionMutation,
      GetLatestSessionMutationVariables
    >(GET_LATEST_SESSION, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    return latestSessionResult.latestSession;
  }
  private async getSubscriptionCount(project: ProjectEntity): Promise<number> {
    const copilotSubscriptionCount = await this.account.gqlClient.gqlRequest<
      GetCopilotSubscriptionCountQuery,
      GetCopilotSubscriptionCountQueryVariables
    >(GET_COPILOT_SUBSCRIPTION_COUNT, {
      projectExId: project.getData("projectExId"),
      sessionType: "COPILOT",
    });
    const count = z.coerce
      .number()
      .safeParse(copilotSubscriptionCount.copilotSubscriptionCount);
    if (!count.success) {
      throw new Error(count.error.message);
    }
    return count.data;
  }
}
