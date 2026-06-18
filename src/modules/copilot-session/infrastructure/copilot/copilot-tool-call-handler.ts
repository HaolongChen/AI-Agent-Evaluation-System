import {
  ClientType,
  Locale,
  Product,
  ZTypeCopilotApi,
  ZTypeCoreApi,
  type CopilotApiResultJs,
  type OpaqueSchemaGraph,
} from "../../../shared/domain/interface/type-system.ts";

export const runCopilotToolCalls = (
  toolCalls: {
    name: string;
    args: unknown;
    id: string;
  }[],
  schemaGraph: unknown,
): CopilotApiResultJs => {
  const product = Product.ZION;
  const clientType = ClientType.WEB;
  const locale = Locale.ZH;
  return ZTypeCopilotApi.toolCalls(
    ZTypeCoreApi.genZTypeApiContext(
      schemaGraph as OpaqueSchemaGraph,
      product,
      clientType,
      "WEB",
      locale,
      // eslint-disable-next-line unicorn/no-null
      null,
    ),
    toolCalls,
  );
};
