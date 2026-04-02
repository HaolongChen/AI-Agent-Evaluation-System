import { createMiddleware } from "langchain";
import { logger } from "../../../utils/logger.ts";

export const inspectMiddleware = createMiddleware({
	name: "inspectMiddleware",
	wrapToolCall: (request, handler) => {
		logger.debug(
			"Inspect Middleware - Request:",
			request.toolCall.name,
			request.toolCall.args,
		);
		return handler(request);
	},
});
