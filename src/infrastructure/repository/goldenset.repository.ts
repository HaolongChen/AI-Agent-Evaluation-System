import type { output, ZodObject, ZodString, ZodDefault, ZodOptional, ZodEnum, ZodUUID, ZodArray, ZodDate } from "zod";
import type { $strip } from "zod/v4/core";
import type { IGoldenSetRepository } from "../../applications/interfaces/goldenset.interface.ts";
import type { goldenSetEntity } from "../../entities/goldenset.entity.ts";

export class GoldenSetRepository implements IGoldenSetRepository
{
  createGoldenSet ( goldenSet: output<ZodObject<{ schemaId: ZodString; copilotType: ZodDefault<ZodOptional<ZodEnum<{ dataModelBuilder: "dataModelBuilder"; uiBuilder: "uiBuilder"; actionFlowBuilder: "actionFlowBuilder"; logAnalyzer: "logAnalyzer"; agentBuilder: "agentBuilder"; }>>>; modelName: ZodDefault<ZodOptional<ZodString>>; }, $strip>> ): Promise<output<ZodObject<{ id: ZodUUID; schemaId: ZodString; copilotType: ZodDefault<ZodOptional<ZodEnum<{ dataModelBuilder: "dataModelBuilder"; uiBuilder: "uiBuilder"; actionFlowBuilder: "actionFlowBuilder"; logAnalyzer: "logAnalyzer"; agentBuilder: "agentBuilder"; }>>>; modelName: ZodDefault<ZodOptional<ZodString>>; }, $strip>>>
  {
    throw new Error( "Method not implemented." );
  }
  getById ( id: output<ZodUUID> ): Promise<output<ZodObject<{ id: ZodUUID; schemaId: ZodString; copilotType: ZodDefault<ZodOptional<ZodEnum<{ dataModelBuilder: "dataModelBuilder"; uiBuilder: "uiBuilder"; actionFlowBuilder: "actionFlowBuilder"; logAnalyzer: "logAnalyzer"; agentBuilder: "agentBuilder"; }>>>; modelName: ZodDefault<ZodOptional<ZodString>>; }, $strip>>>
  {
    throw new Error( "Method not implemented." );
  }
  getByFilters ( filters: Partial<output<ZodObject<{ id: ZodUUID; schemaId: ZodString; copilotType: ZodDefault<ZodOptional<ZodEnum<{ dataModelBuilder: "dataModelBuilder"; uiBuilder: "uiBuilder"; actionFlowBuilder: "actionFlowBuilder"; logAnalyzer: "logAnalyzer"; agentBuilder: "agentBuilder"; }>>>; modelName: ZodDefault<ZodOptional<ZodString>>; }, $strip>>> ): Promise<Array<output<ZodObject<{ id: ZodUUID; schemaId: ZodString; copilotType: ZodDefault<ZodOptional<ZodEnum<{ dataModelBuilder: "dataModelBuilder"; uiBuilder: "uiBuilder"; actionFlowBuilder: "actionFlowBuilder"; logAnalyzer: "logAnalyzer"; agentBuilder: "agentBuilder"; }>>>; modelName: ZodDefault<ZodOptional<ZodString>>; }, $strip>>>>
  {
    throw new Error( "Method not implemented." );
  }
  getUserInputsByGoldenSetId ( id: output<ZodUUID> ): Promise<output<ZodArray<ZodObject<{ id: ZodUUID; content: ZodString; createdBy: ZodDefault<ZodString>; createdAt: ZodDate; }, $strip>>>>
  {
    throw new Error( "Method not implemented." );
  }
  createUserInputWithGoldenSetId ( goldenSetId: output<ZodUUID>, userInput: output<ZodObject<{ id: ZodUUID; content: ZodString; createdBy: ZodDefault<ZodString>; createdAt: ZodDate; }, $strip>> ): Promise<output<ZodArray<ZodObject<{ id: ZodUUID; content: ZodString; createdBy: ZodDefault<ZodString>; createdAt: ZodDate; }, $strip>>>>
  {
    throw new Error( "Method not implemented." );
  }
  linkGoldenSetToUserInput ( goldenSetId: output<ZodUUID>, userInputId: output<ZodUUID> ): Promise<output<goldenSetEntity>>
  {
    throw new Error( "Method not implemented." );
  }

}