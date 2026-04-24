import z from "zod";

export const agentFeedbackEntity = z.object( {
  internal: z.object( {
    id: z.uuidv4(),
    rubricId: z.uuidv4(),
    agentName: z.string(), //TODO: should be enumerated from deep agents
    createdAt: z.date()
  } ),
  external: z.object( {})
})