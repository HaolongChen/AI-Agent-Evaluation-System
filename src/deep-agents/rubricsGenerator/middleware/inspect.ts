import { createMiddleware } from "langchain";


export const inspectMiddleware = createMiddleware({
	name: "inspectMiddleware",
	wrapToolCall: (request, handler) => {
		console.debug(
			"Inspect Middleware - Request:",
			request.toolCall.name,
			request.toolCall.args,
		);
		return handler(request);
	},
});
