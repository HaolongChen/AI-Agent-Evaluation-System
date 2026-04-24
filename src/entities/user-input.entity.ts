import z from "zod";
import { goldenSetEntity } from "./goldenset.entity.ts";

export const userInputInternalEntity = z.object({
  id: z.uuidv4(),
  content: z.string().nonempty(),
  createdBy: z.string().default("unknown"),
  createdAt: z.date(),
});

export const userInputEntity = z.object({
  internal: userInputInternalEntity,

  external: z.object({
    goldenSets: z.array(goldenSetEntity.shape.internal),
  }),
});
