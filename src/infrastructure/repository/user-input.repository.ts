import type { output, ZodObject, ZodString, ZodDefault, ZodUUID, ZodDate } from "zod";
import type { $strip } from "zod/v4/core";
import type { IUserInputRepository } from "../../applications/interfaces/user-input.interface.ts";

export class UserInputRepository implements IUserInputRepository
{
  create ( userInput: output<ZodObject<{ content: ZodString; createdBy: ZodDefault<ZodString>; }, $strip>> ): Promise<output<ZodObject<{ id: ZodUUID; content: ZodString; createdBy: ZodDefault<ZodString>; createdAt: ZodDate; }, $strip>>>
  {
    throw new Error( "Method not implemented." );
  }
  getById ( id: output<ZodUUID> ): Promise<output<ZodObject<{ id: ZodUUID; content: ZodString; createdBy: ZodDefault<ZodString>; createdAt: ZodDate; }, $strip>>>
  {
    throw new Error( "Method not implemented." );
  }

}