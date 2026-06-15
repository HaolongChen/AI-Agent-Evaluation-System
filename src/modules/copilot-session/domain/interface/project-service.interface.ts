import type { Account } from "../../../account/domain/aggregate/account.aggregate.ts";
import type { NetworkClientEntity } from "../../../account/domain/entity/network-client.entity.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export interface IZionProjectService {
  createProjectInZion(
    zionProject: ZionProject,
    account: Account
  ): Promise<string>;

  deleteProjectInZion(
    projectExId: string,
    networkClient: NetworkClientEntity
  ): Promise<void>;
}
