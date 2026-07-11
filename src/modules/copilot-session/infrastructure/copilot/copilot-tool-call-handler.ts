import type { NetworkClient } from "../../../account/domain/entity/network-client.entity.ts";
import {
  ClientType,
  Locale,
  Product,
  ZTypeCopilotApi,
  ZTypeCoreApi,
  type CopilotApiResultJs,
  type OpaqueSchemaGraph,
} from "../../../shared/domain/interface/type-system.ts";
import type { IZionProjectService } from "../../domain/interface/project-service.interface.ts";

export type ToolCall = {
  name: string;
  args: unknown;
  id: string;
};

export class CopilotToolCallHandler {
  constructor(private readonly projectService: IZionProjectService) {}

  setStaticProject(projectExId: string, projectNetwork: NetworkClient) {
    return async (toolCalls: ToolCall[]) => {
      return this.run(toolCalls, projectExId, projectNetwork);
    };
  }

  async run(
    toolCalls: ToolCall[],
    projectExId: string,
    projectNetwork: NetworkClient,
  ): Promise<CopilotApiResultJs> {
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
          projectNetwork,
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
