import type { z } from "zod";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
	Entity,
	type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import {
	projectConfigSchema,
	projectSchema,
} from "../schema/project.schema.ts";
import { ZionProject } from "../entity/zion-project.entity.ts";
import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";

export class ProjectAggregate extends AggregateRoot<
	typeof projectSchema,
	EntityMetadata & { projectExId?: string },
	{ copilotInput: CopilotInputAggregate, network: NetworkClient }
> {
	constructor(copilotInput: CopilotInputAggregate, network: NetworkClient, id?: string) {
		super(
			new Entity<
				typeof projectSchema,
				EntityMetadata & { projectExId?: string }
			>({ copilotInputId: copilotInput.getData("id") }, projectSchema, {id}),
			{ copilotInput, network },
		);
	}

	configureZionProject(
		config: z.input<typeof projectConfigSchema>,
	): ZionProject {
		return new ZionProject({
			...config,
			projectName: this.getEntity("copilotInput").projectName,
			schemaId: this.getEntity("copilotInput")
				.getEntity("goldenSet")
				.getData("schemaId"),
		});
  }

  static complete ( projectExId: string, projectId: string, copilotInput: CopilotInputAggregate, network: NetworkClient ): ProjectAggregate
  {
    const projectAggregate = new ProjectAggregate( copilotInput, network, projectId );
    projectAggregate.setData( { projectExId } );
    return projectAggregate;
  }
}
