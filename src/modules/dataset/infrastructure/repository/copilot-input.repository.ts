import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotInputAggregate } from "../../domain/aggregate/copilot-input.aggregate.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.ts";
import type { ICopilotInputRepository } from "../../domain/interface/copilot-input.interface.ts";
import {
  goldenSetDataMapper,
  type GoldenSetRepositoryType,
} from "./golden-set.repository.ts";
import {
  userInputDataMapper,
  type UserInputRepositoryType,
} from "./user-input.repository.ts";

export type CopilotInputRepositoryType = {
  id: string;
  goldenSetId: string;
  userInputId: string;
  createdAt: Date;
  goldenSet?: GoldenSetRepositoryType;
  userInput?: UserInputRepositoryType;
};

export type CopilotInputDataMapperParameter = {
  goldenSet?: GoldenSetEntity;
  userInput?: UserInputEntity;
};

export const copilotInputDataMapper = (
  copilotInput: CopilotInputRepositoryType,
  entity?: CopilotInputDataMapperParameter,
): CopilotInputAggregate => {
  let goldenSetEntity: GoldenSetEntity | undefined;
  let userInputEntity: UserInputEntity | undefined;

  if (copilotInput.goldenSet) {
    goldenSetEntity = goldenSetDataMapper(copilotInput.goldenSet);
  } else if (entity && "goldenSet" in entity) {
    goldenSetEntity = entity.goldenSet as GoldenSetEntity;
  }

  if (copilotInput.userInput) {
    userInputEntity = userInputDataMapper(copilotInput.userInput);
  } else if (entity && "userInput" in entity) {
    userInputEntity = entity.userInput as UserInputEntity;
  }
  if (!goldenSetEntity || !userInputEntity) {
    throw new Error("Missing required entities for CopilotInputAggregate");
  }

  return repositoryDateMapper(
    copilotInput,
    new CopilotInputAggregate(
      goldenSetEntity,
      userInputEntity,
      copilotInput.id,
    ),
  );
};

export class CopilotInputRepository implements ICopilotInputRepository {
  async findById(id: string): Promise<CopilotInputAggregate> {
    const result = await prisma.copilotInput.findUnique({
      where: { id },
      include: {
        goldenSet: true,
        userInput: true,
      },
    });
    if (!result) {
      throw new Error(`CopilotInput with ID ${id} not found`);
    }
    return copilotInputDataMapper(result);
  }
  async save(data: CopilotInputAggregate): Promise<void> {
    const result = await prisma.copilotInput.create({
      data: {
        id: data.getData("id"),
        goldenSetId: data.getEntity("goldenSet")[0].getData("id"),
        userInputId: data.getEntity("userInput")[0].getData("id"),
      },
      // include: { userInput: true, goldenSet: true },
    });
    repositoryDateMapper(result, data);
  }
}
