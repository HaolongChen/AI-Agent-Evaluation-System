import type { Account } from "../../account/domain/entity/account.entity.ts";
import type { CopilotInputAggregate } from "../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { CopilotServerEntity } from "../../dataset/domain/entity/copilot-server.entity.ts";
import { CopilotExecutionAggregate } from "../domain/aggregate/copilot-execution.aggregate.ts";
import { CopilotOutputAggregate } from "../domain/aggregate/copilot-output.aggregate.ts";
import { ProjectAggregate } from "../domain/aggregate/project.aggregate.ts";
import type {
  CopilotExecutionInfo,
  ICopilotRepository,
} from "../domain/interface/copilot-repository.interface.ts";
import type { IProjectRepository } from "../domain/interface/project-repository.interface.ts";
import { CopilotExecutionLog } from "../domain/value-object/copilot-execution-log.ts";

export class GetCopilotSessionUseCase {
  constructor(
    private repository: {
      projectRepository: IProjectRepository;
      copilotRepository: ICopilotRepository;
    },
  ) {}

  private buildCopilotOutput(
    output: CopilotExecutionInfo<"withSession">,
    copilotServer: CopilotServerEntity,
    project: ProjectAggregate,
  ): CopilotOutputAggregate {
    const copilotExecution = CopilotExecutionAggregate.reconcile(
      copilotServer,
      project,
    );
    return new CopilotOutputAggregate(
      copilotExecution,
      new CopilotExecutionLog(output),
    );
  }

  private buildProject(
    projectInfo: CopilotExecutionInfo<"withSession">["project"],
    copilotInput: CopilotInputAggregate,
    account: Account,
  ): ProjectAggregate {
    const project = new ProjectAggregate(copilotInput, account, projectInfo.id);
    project.activate(projectInfo.projectExId);
    return project;
  }

  private buildCopilotExecutionAggregate(
    output: CopilotExecutionInfo<"withSession">,
    copilotServer: CopilotServerEntity,
    project: ProjectAggregate,
  ): CopilotExecutionAggregate {
    const copilotExecution = CopilotExecutionAggregate.reconcile(
      copilotServer,
      project,
    );
    copilotExecution.start(output.copilotSessionExId);
    return copilotExecution;
  }

  async execute(
    copilotInput: CopilotInputAggregate,
    copilotServer: CopilotServerEntity,
    account: Account,
  ): Promise<CopilotOutputAggregate[]> {
    const copilotOutputs =
      await this.repository.copilotRepository.getByCopilotInputAndCopilotServer(
        copilotInput.getData("id"),
        copilotServer.getData("id"),
      );
    return copilotOutputs
      .filter((output) => Object.keys(output).includes("copilotSessionExId"))
      .map((output) => {
        const project = this.buildProject(
          output.project,
          copilotInput,
          account,
        );

        return this.buildCopilotOutput(
          output as CopilotExecutionInfo<"withSession">,
          copilotServer,
          project,
        );
      });
  }
}
