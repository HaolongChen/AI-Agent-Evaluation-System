import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import { crdtSchemaSchema } from "../schema/crdt-schema.schema.ts";
import type { CopilotExecutionLogs } from "../schema/project.schema.ts";
import type { CrdtSchemaAggregate } from "./crdt-schema.aggregate.ts";

export class CopilotExecutionAggregate extends AggregateRoot<typeof crdtSchemaSchema> {
	private executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

	constructor(data: CrdtSchemaAggregate) {
		super(data, {});
	}

  sessionCreated ( copilotSessionExId: string ) {}

  aiResponseReceived ( message: string )
  {
    this.executionLogs.aiResponse = message;
  }

  editableTextReceived ( message: string )
  {
    this.executionLogs.editableText = message;
  }

  taskReceived ( task: unknown )
  {
    if (this.executionLogs.tasks) {
      this.executionLogs.tasks.push(task);
    } else {
      this.executionLogs.tasks = [task];
    }
  }

  toolCallReceived ( toolCall: unknown ) {}
}