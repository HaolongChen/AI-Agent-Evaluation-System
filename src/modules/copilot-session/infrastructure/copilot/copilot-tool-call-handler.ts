import {
  ClientType,
  Locale,
  Product,
  ZTypeCopilotApi,
  ZTypeCoreApi,
  type CopilotApiResultJs,
  type OpaqueSchemaGraph,
} from "../../../shared/domain/interface/type-system.ts";
import type { ProjectAggregate } from "../../domain/aggregate/project.aggregate.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export type ToolCall = {
  name: string;
  args: unknown;
  id: string;
};

export class CopilotToolCallHandler {
  constructor(private readonly projectService: IZionProjectService) {}

  setStaticProject(project: ProjectAggregate) {
    return async (toolCalls: ToolCall[]) => {
      return this.run(toolCalls, project);
    };
  }

  async run(
    toolCalls: ToolCall[],
    project: ProjectAggregate,
  ): Promise<CopilotApiResultJs> {
    const projectExId =
      project.state.status === "active" ? project.state.projectExId : undefined;
    if (!projectExId) {
      throw new Error("Project must be active to run copilot tool calls.");
    }
    const product = Product.ZION;
    const clientType = ClientType.WEB;
    const locale = Locale.ZH;
    return ZTypeCopilotApi.toolCalls(
      ZTypeCoreApi.genZTypeApiContext(
        (await this.projectService.getSchemaGraph(
          projectExId,
          project.network,
        )) as OpaqueSchemaGraph,
        product,
        clientType,
        "WEB",
        locale,
        // eslint-disable-next-line unicorn/no-null
        null,
      ),
      toolCalls,
    );
  }
}
