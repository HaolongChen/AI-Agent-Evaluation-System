import { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import type { CopilotServerEntity } from "../../../dataset/domain/entity/copilot-server.entity.ts";
import type { UserInputEntity } from "../../../dataset/domain/entity/user-input.entity.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { CopilotSessionCreatedEvent } from "../event/copilot-session-created.ts";
import { copilotExecutionSchema } from "../schema/copilot.schema.ts";

// TODO: should be divided into two aggregates: CopilotExecutionAggregate and CopilotSessionAggregate
// pending -> add project -> create session -> running -> complete
export class CopilotExecutionAggregate extends AggregateRoot<
  typeof copilotExecutionSchema,
  EntityMetadata,
  { userInput: UserInputEntity; copilotServer: CopilotServerEntity }
> {
  constructor(
    copilotServer: CopilotServerEntity,
    userInput: UserInputEntity,
    projectExId: string,
    id?: string,
  ) {
    const entity = new Entity<typeof copilotExecutionSchema, EntityMetadata>(
      {
        projectExId,
      },
      copilotExecutionSchema,
      { id },
    );
    super(entity, { copilotServer, userInput });
  }

  // get state() {
  //   return this.getData("state");
  // }

  // static reconcile(
  //   copilotServer: CopilotServerEntity,
  //   project: ProjectAggregate,
  // ) {
  //   const copilotExecution = new CopilotExecutionAggregate(
  //     copilotServer,
  //     project.getData("copilotInputId"),
  //   );
  //   copilotExecution.importProject(project);
  //   return copilotExecution;
  // }

  // static createExecutionTask(
  //   copilotServer: CopilotServerEntity,
  //   copilotInputId: string,
  // ): CopilotExecutionAggregate {
  //   const copilotExecution = new CopilotExecutionAggregate(
  //     copilotServer,
  //     copilotInputId,
  //   );
  //   copilotExecution.addEvent(
  //     new CopilotExecutionTaskCreatedEvent({
  //       copilotExecution,
  //       copilotInputId,
  //     }),
  //   );
  //   return copilotExecution;
  // }

  // protected importProject(project: ProjectAggregate) {
  //   if (project.getData("copilotInputId") !== this.copilotInputId) {
  //     throw new Error("Project ID mismatch.");
  //   }
  //   this.project = project;
  // }

  // verifyActivatedProject(project: ProjectAggregate): string {
  //   if (
  //     project.getData("copilotInputId") !== this.copilotInputId &&
  //     project.state.status === "active"
  //   ) {
  //     throw new Error(
  //       "Project ID mismatch between CopilotExecutionAggregate and ProjectAggregate.",
  //     );
  //   }
  //   const projectExId = project.acquire();
  //   this.project = project;
  //   return projectExId;
  // }

  isRunning(): boolean {
    return !!this.getData("copilotSessionExId");
  }

  configureNetwork(network: NetworkClient): NetworkClient {
    network.setWebSocketUrl(
      this.getEntity("copilotServer").getData("wsEndpoint"),
    );
    network.setGraphQLUrl(
      this.getEntity("copilotServer").getData("gqlEndpoint"),
    );
    return network;
  }

  start(
    copilotSessionExId: string,
    projectNetwork: NetworkClient,
    copilotNetwork: NetworkClient,
  ) {
    this.setData({ copilotSessionExId });
    this.addEvent(
      new CopilotSessionCreatedEvent({
        copilotSessionExId,
        copilotNetwork: this.configureNetwork(copilotNetwork),
        projectExId: this.getData("projectExId"),
        projectNetwork,
      }),
    );
    // this.project = undefined;
  }
}
