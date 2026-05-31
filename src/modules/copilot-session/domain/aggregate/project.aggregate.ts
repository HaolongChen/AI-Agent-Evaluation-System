import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { ProjectEntity } from "../entity/project.entity.ts";
import { projectSchema } from "../schema/project.schema.ts";
import type { CopilotInputAggregate } from "../../../dataset/domain/aggregate/copilot-input.aggregate.ts";
import type { EntityMetadata } from "../../../shared/domain/entity/entity.ts";
import type { CopilotSessionEntity } from "../entity/copilot-session.entity.ts";
import { CopilotOutputEntity } from "../entity/copilot-output.entity.ts";
import { logger } from "../../../shared/infrastructure/logger.ts";

export class ProjectAggregate extends AggregateRoot<
	typeof projectSchema,
	EntityMetadata,
	{
		copilotInput: CopilotInputAggregate;
		copilotSession?: CopilotSessionEntity;
		copilotOutput?: CopilotOutputEntity;
	}
> {
	public copilotServerId: string;
	constructor(data: ProjectAggregate, copilotServerId: string);
	constructor(
		copilotInputAggregate: CopilotInputAggregate,
		copilotServerId: string,
		projectEntity: ProjectEntity,
	);
	constructor(
		argument1: ProjectAggregate | CopilotInputAggregate,
		copilotServerId: string,
		argument3?: ProjectEntity,
	) {
		if (argument1 instanceof ProjectAggregate) {
			super(argument1);
			this.setEntity("copilotInput", argument1.getEntity("copilotInput"));
		} else {
			super(argument3!);
			this.setEntity("copilotInput", argument1);
		}
		this.copilotServerId = copilotServerId;
	}

	buildCopilotOutput(): CopilotOutputEntity | undefined {
		const copilotOutputEntity = this.getEntity("copilotOutput");
		if (copilotOutputEntity) {
			return copilotOutputEntity;
		}
		const copilotSessionEntity = this.getEntity("copilotSession");
		if (!copilotSessionEntity) {
			return undefined;
		}
		const copilotSessionExId = copilotSessionEntity.getData("id");
		const aiResponse = copilotSessionEntity.getData("aiResponse");
		const editableText = copilotSessionEntity.getData("editableText");
		// const schemaGraph = copilotSessionEntity.getData("schemaGraph");
		// const tasks = copilotSessionEntity.getData("tasks");
		if (!aiResponse || !editableText) {
			logger.warn(
				`Missing aiResponse or editableText for copilotSession with id ${copilotSessionExId}`,
			);
			return undefined;
		}
		this.setEntity(
			"copilotOutput",
			new CopilotOutputEntity({
				copilotSessionExId,
				aiResponse,
				editableText,
			}),
		);
	}
}
