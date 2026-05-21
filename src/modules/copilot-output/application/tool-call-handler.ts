/* eslint-disable unicorn/no-null */
import type { CopilotToolCallBatchMessageFragment_toolCalls } from "../../../graphql/generated/types.ts";
import {
	ClientType,
	ZTypeCopilotApi,
	Locale,
	Product,
	type CopilotApiResultJs,
	ZTypeCoreApi,
	type OpaqueSchemaGraph,
} from "../../shared/domain/interface/type-system.ts";
export function runToolCalls(
	toolCalls: CopilotToolCallBatchMessageFragment_toolCalls[],
	schemaGraph: OpaqueSchemaGraph,
): CopilotApiResultJs {
	const product = Product.ZION;
	const clientType = ClientType.WEB;
	const locale = Locale.ZH;
	return ZTypeCopilotApi.toolCalls(
		ZTypeCoreApi.genZTypeApiContext(
			schemaGraph,
			product,
			clientType,
			"WEB",
			locale,
			null,
		),
		toolCalls.map((toolCall) => {
			return {
				name: toolCall.name,
				args: toolCall.args,
				toolCallId: toolCall.id,
			};
		}),
	);
}
