import type z from "zod";
import { goldenSetEntity } from "../../entities/goldenset.entity.js";

const goldenSetInternalEntityWithoutId = goldenSetEntity.shape.internal.omit( { id: true } )

export interface IGoldenSetRepository
{
  createGoldenSet ( goldenSet: z.infer<typeof goldenSetInternalEntityWithoutId> ): Promise<z.infer<typeof goldenSetEntity.shape.internal>>;

  getById ( id: z.infer<typeof goldenSetEntity.shape.internal.shape.id> ): Promise<z.infer<typeof goldenSetEntity.shape.internal>>;

  getByFilters ( filters: Partial<z.infer<typeof goldenSetEntity.shape.internal>> ): Promise<Array<z.infer<typeof goldenSetEntity.shape.internal>>>;

  getUserInputsByGoldenSetId ( id: z.infer<typeof goldenSetEntity.shape.internal.shape.id> ): Promise<z.infer<typeof goldenSetEntity.shape.external.shape.userInputs>>;

  createUserInputWithGoldenSetId ( goldenSetId: z.infer<typeof goldenSetEntity.shape.internal.shape.id>, userInput: z.infer<typeof goldenSetEntity.shape.external.shape.userInputs.element> ): Promise<z.infer<typeof goldenSetEntity.shape.external.shape.userInputs>>;

  linkGoldenSetToUserInput ( goldenSetId: z.infer<typeof goldenSetEntity.shape.internal.shape.id>, userInputId: z.infer<typeof goldenSetEntity.shape.external.shape.userInputs.element.shape.id> ): Promise<z.infer<typeof goldenSetEntity>>;
}