import { AggregateRoot } from "../../../shared/domain/aggregate/aggregate-root.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { copilotExecutionSchema } from "../schema/copilot.schema.ts";
import type { CopilotExecutionLogs } from "../schema/project.schema.ts";
import type { CrdtSchemaAggregate } from "./crdt-schema.aggregate.ts";
// export class CopilotExecutionAggregate extends AggregateRoot<typeof crdtSchemaSchema> {
// 	private executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

// 	constructor(data: CrdtSchemaAggregate) {
// 		super(data, {});
// 	}

//   sessionCreated ( copilotSessionExId: string ) {}

//   aiResponseReceived ( message: string )
//   {
//     this.executionLogs.aiResponse = message;
//   }

//   editableTextReceived ( message: string )
//   {
//     this.executionLogs.editableText = message;
//   }

//   taskReceived ( task: unknown )
//   {
//     if (this.executionLogs.tasks) {
//       this.executionLogs.tasks.push(task);
//     } else {
//       this.executionLogs.tasks = [task];
//     }
//   }

//   toolCallReceived ( toolCall: unknown ) {}
// }

export class CopilotExecutionAggregate extends AggregateRoot<
  typeof copilotExecutionSchema,
  EntityMetadata & {
    userInput: string;
  },
  { crdtSchema: CrdtSchemaAggregate }
> {
  public executionLogs: CopilotExecutionLogs = {} as CopilotExecutionLogs;

  constructor(
    crdtSchema: CrdtSchemaAggregate,
    copilotSessionExId: string,
    userInput: string,
  ) {
    super(
      new Entity(
        { copilotSessionExId, projectId: crdtSchema.getData("id") },
        copilotExecutionSchema,
        { userInput },
      ),
      { crdtSchema },
    );
  }
}
