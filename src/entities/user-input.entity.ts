import z from "zod";

export const userInputEntity = z.object( {
  internal: z.object( {
    id: z.uuidv4(),
    content: z.string().nonempty(),
    createdBy: z.string().default( "unknown" ),
    createdAt: z.date(),
  } ),
  external: z.object( {} ),
})