import type z from "zod";
import { userInputEntity } from "../../entities/user-input.entity.js";

const initialUserInputEntity = userInputEntity.shape.internal.omit({
  id: true,
  createdAt: true,
});

export interface IUserInputRepository {
  create(
    userInput: z.infer<typeof initialUserInputEntity>,
  ): Promise<z.infer<typeof userInputEntity.shape.internal>>;

  getById(
    id: z.infer<typeof userInputEntity.shape.internal.shape.id>,
  ): Promise<z.infer<typeof userInputEntity.shape.internal>>;
}
