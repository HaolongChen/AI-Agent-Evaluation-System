import type { output, ZodObject, ZodString, ZodBoolean, ZodNullable, ZodFloat32, ZodUUID, ZodDate, ZodArray } from "zod";
import type { $strip } from "zod/v4/core";
import type { IRubricRepository } from "../../applications/interfaces/rubric.interface.ts";

export class RubricRepository implements IRubricRepository
{
  createRubricWithCriterion ( criterion: output<ZodObject<{ content: ZodString; expectation: ZodBoolean; reasoning: ZodNullable<ZodString>; weight: ZodFloat32; }, $strip>> ): Promise<output<ZodObject<{ internal: ZodObject<{ id: ZodUUID; createdAt: ZodDate; }, $strip>; external: ZodObject<{ criterion: ZodArray<ZodObject<{ id: ZodUUID; content: ZodString; expectation: ZodBoolean; reasoning: ZodNullable<ZodString>; weight: ZodFloat32; }, $strip>>; }, $strip>; }, $strip>>>
  {
    throw new Error( "Method not implemented." );
  }

}