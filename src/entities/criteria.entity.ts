import z from "zod";

export const criteriaEntity = z.object( {
  internal: z.object( {
    id: z.uuidv4(),
    content: z.string().nonempty(),
    expectation: z.boolean(),
    reasoning: z.string().nullable(),
    weight: z.float32().positive().max(1)
  } ),
  external: z.object( {} ),
})