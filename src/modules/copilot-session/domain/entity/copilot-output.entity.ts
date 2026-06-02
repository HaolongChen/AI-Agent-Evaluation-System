import type z from "zod";
import { Entity } from "../../../shared/domain/entity/entity.ts";
import { copilotOutputSchema } from "../schema/copilot-output.schema.ts";
import type { ProjectEntity } from "./project.entity.ts";

export class CopilotOutputEntity extends Entity<typeof copilotOutputSchema> {
  constructor ( data: Omit<z.infer<typeof copilotOutputSchema>, "copilotSessionExId">, project: ProjectEntity, id?: string )
  {
    const copilotSessionExId = project.getData( "copilotSessionExId" );
    if ( !copilotSessionExId )    {
      throw new Error( "copilotSessionExId is required in project to create CopilotOutputEntity" );
    }
    super({...data, copilotSessionExId}, copilotOutputSchema, { id });
  }
}
