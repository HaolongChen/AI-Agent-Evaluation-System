import type { Account } from "../../../account/domain/entity/account.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { ZionProject } from "../entity/zion-project.entity.ts";

export interface IZionProjectService {
  createProjectInZion(
    zionProject: ZionProject,
    account: Account,
    networkClient: NetworkClient,
  ): Promise<string>;

  deleteProjectInZion(
    projectExId: string,
    networkClient: NetworkClient,
  ): Promise<void>;
}
