import { prisma } from "../../../../config/prisma.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { CopilotInputAggregate } from "../../domain/aggregate/copilot-input.aggregate.ts";
import { GoldenSetEntity } from "../../domain/entity/golden-set.entity.ts";
import { UserInputEntity } from "../../domain/entity/user-input.entity.ts";
import type {
  CopilotInputFilters,
  ICopilotInputRepository,
} from "../../domain/interface/copilot-input.interface.ts";
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
  async addUserInput ( goldenSet: GoldenSetEntity, userInputs: UserInputEntity[] ): Promise<CopilotInputAggregate[]>
  {
    const result = Promise.all( userInputs.map( async ( userInput ) =>
    {
      const copilotInput = await prisma.copilotInput.upsert( {
        where: {
          goldenSetId_userInputId: {
            goldenSetId: goldenSet.getData( "id" ),
            userInputId: userInput.getData( "id" ),
          }
        },
        update: {},
        create: {
          goldenSetId: goldenSet.getData( "id" ),
          userInputId: userInput.getData( "id" ),
        },
        include: { goldenSet: true, userInput: true },
      } );
      return copilotInputDataMapper( copilotInput );
    } ) );
    return result;
  }
  async getByFilters(
    filters: CopilotInputFilters,
  ): Promise<CopilotInputAggregate>;
  async getByFilters(
    filters?: Partial<CopilotInputFilters> | undefined,
  ): Promise<CopilotInputAggregate[]>;
  async getByFilters<T extends Partial<CopilotInputFilters> | undefined>(
    filters: T,
  ): Promise<
    T extends CopilotInputFilters
      ? CopilotInputAggregate
      : CopilotInputAggregate[]
  > {
    if (filters?.goldenSetId && filters?.userInputId) {
      return copilotInputDataMapper(
        await prisma.copilotInput.findUniqueOrThrow({
          where: {
            goldenSetId_userInputId: {
              goldenSetId: filters.goldenSetId,
              userInputId: filters.userInputId,
            },
          },
          include: { goldenSet: true, userInput: true },
        }),
      ) as T extends CopilotInputFilters
        ? CopilotInputAggregate
        : CopilotInputAggregate[];
    }
    const results = await prisma.copilotInput.findMany({
      where: filters,
      include: {
        goldenSet: true,
        userInput: true,
      },
    });
    return results.map((result) =>
      copilotInputDataMapper(result),
    ) as T extends CopilotInputFilters
      ? CopilotInputAggregate
      : CopilotInputAggregate[];
  }
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
        goldenSetId: data.getEntity("goldenSet").getData("id"),
        userInputId: data.getEntity("userInput").getData("id"),
      },
      // include: { userInput: true, goldenSet: true },
    });
    repositoryDateMapper(result, data);
  }
}
