import { prisma } from "../../../../config/prisma.ts";
import type { Decimal } from "../../../../prisma/build/generated/prisma/internal/prismaNamespace.ts";
import type { ProjectAggregate } from "../../../copilot-session/domain/aggregate/project.aggregate.ts";
import type { CopilotOutputEntity } from "../../../copilot-session/domain/entity/copilot-output.entity.ts";
import { CopilotOutputFactory } from "../../../copilot-session/domain/service/copilot-output-factory.ts";
import {
  copilotOutputDataMapper,
  type CopilotOutputRepositoryType,
  type ProjectRepositoryType,
} from "../../../copilot-session/infrastructure/repository/project.repository.ts";
import type { GoldenSetEntity } from "../../../dataset/domain/entity/golden-set.entity.ts";
import type { UserInputEntity } from "../../../dataset/domain/entity/user-input.entity.ts";
import { goldenSetDataMapper } from "../../../dataset/infrastructure/repository/golden-set.repository.ts";
import { userInputDataMapper } from "../../../dataset/infrastructure/repository/user-input.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { RubricAggregate } from "../../domain/aggregate/rubric.aggregate.js";
import { CriteriaEntity } from "../../domain/entity/rubric.entity.js";
import type { IRubricRepository } from "../../domain/interface/rubric.interface.ts";

export type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object ? DeepRequired<T[K]> : Required<T[K]>;
};

export type CriteriaRepositoryType = {
  id: string;
  createdAt: Date;
  rubricId: string;
  content: string;
  expectedAnswer: boolean;
  weight: Decimal;
  reasoning: string | null;
};

export type RubricRepositoryType = {
  id: string;
  copilotSessionExId: string;
  createdAt: Date;
  criterion?: CriteriaRepositoryType[];
  copilotSession?: {
    id: string;
    project?: DeepRequired<Omit<ProjectRepositoryType, "copilotSession">>;
    copilotOutput?: CopilotOutputRepositoryType | null;
  } | null;
};

export const criteriaDataMapper = (
  data: CriteriaRepositoryType,
  entity?: CriteriaEntity,
): CriteriaEntity => {
  const criteria = repositoryDateMapper(
    data,
    entity ??
      new CriteriaEntity(
        {
          ...data,
          weight: Number(data.weight),
          reasoning: data.reasoning ?? undefined,
        },
        data.id,
      ),
  );
  criteria.setData({ isSaved: true });
  return criteria;
};

export const criterionDataMapper = (
  data: CriteriaRepositoryType[],
  entities: CriteriaEntity[],
): CriteriaEntity[] => {
  if (data.length < entities.length) {
    throw new Error(
      "Data length is less than entity length, some criteria might be lost.",
    );
  }
  const unloadedCriterion: CriteriaEntity[] = [];
  for (const criterionData of data) {
    let isMatched: boolean = false;
    for (const entity of entities) {
      if (entity.getData("id") === criterionData.id) {
        criteriaDataMapper(criterionData, entity);
        isMatched = true;
        break;
      }
    }
    if (!isMatched) {
      unloadedCriterion.push(criteriaDataMapper(criterionData));
    }
  }
  return unloadedCriterion;
};

export type RubricDataMapperParameter = {
  aggregate?: RubricAggregate;
  entity?: {
    goldenSet?: GoldenSetEntity;
    userInput?: UserInputEntity;
    copilotOutput?: CopilotOutputEntity;
  };
};

export const rubricDataMapper = (
  data: RubricRepositoryType,
  entity?: RubricDataMapperParameter,
): RubricAggregate => {
  const goldenSet = goldenSetDataMapper(
    data.copilotSession?.project?.copilotInput?.goldenSet,
    entity?.aggregate?.getEntity("goldenSet") ?? entity?.entity?.goldenSet,
  );
  const userInput = userInputDataMapper(
    data.copilotSession?.project?.copilotInput?.userInput,
    entity?.aggregate?.getEntity("userInput") ?? entity?.entity?.userInput,
  );
  const copilotOutput = copilotOutputDataMapper(
    data.copilotSession?.copilotOutput,
    entity?.aggregate?.getEntity("copilotOutput") ??
      entity?.entity?.copilotOutput ??
      new CopilotOutputFactory(data.copilotSession!.id),
  );
  if (data.criterion?.length === 0 || !data.criterion) {
    return repositoryDateMapper(
      data,
      entity?.aggregate ??
        new RubricAggregate({ goldenSet, userInput, copilotOutput }, data.id),
    );
  }
  const unloadedCriterion = criterionDataMapper(
    data.criterion,
    entity?.aggregate?.getEntity("criterion") ?? [],
  );
  if (entity?.aggregate) {
    for (const criteria of unloadedCriterion) {
      entity.aggregate.addCriteria(criteria);
    }
    return repositoryDateMapper(data, entity.aggregate);
  }
  const rubricAggregate = repositoryDateMapper(
    data,
    new RubricAggregate({ goldenSet, userInput, copilotOutput }, data.id),
  );
  rubricAggregate.pushEntity("criterion", unloadedCriterion);
  return rubricAggregate;
};

export class RubricRepository implements IRubricRepository {
  async getByProject(
    project: ProjectAggregate,
  ): Promise<Array<RubricAggregate>> {
    const goldenSet = project.getEntity("copilotInput").getEntity("goldenSet");
    const userInput = project.getEntity("copilotInput").getEntity("userInput");
    const copilotOutput = project.getEntity("copilotOutput");
    if (!goldenSet || !userInput || !copilotOutput) {
      throw new Error(
        "Project is missing required entities to build a rubric.",
      );
    }
    const rubrics = await prisma.rubric.findMany({
      where: {
        copilotSessionExId: project.copilotSessionExId,
      },
      include: { criterion: true },
    });
    return rubrics.map((rubric) =>
      rubricDataMapper(rubric, {
        entity: {
          goldenSet,
          userInput,
          copilotOutput,
        },
      }),
    );
  }

  async deleteCriterion(criterionId: string): Promise<void> {
    await prisma.criteria.delete({ where: { id: criterionId } });
  }
  async deleteRubric(rubricId: string): Promise<void> {
    await prisma.rubric.delete({ where: { id: rubricId } });
  }
  async save(aggregate: RubricAggregate): Promise<void> {
    const criterion = aggregate.getEntity("criterion");
    const result = await prisma.rubric.upsert({
      where: { id: aggregate.getData("id") },
      create: {
        id: aggregate.getData("id"),
        copilotSessionExId: aggregate
          .getEntity("copilotOutput")
          .getData("copilotSessionExId"),
        ...(criterion.length > 0
          ? {
              criterion: {
                createMany: {
                  data: criterion.map((criteria) => criteria.getData()),
                },
              },
            }
          : {}),
      },
      update: {
        ...(criterion.length > 0
          ? {
              criterion: {
                createMany: {
                  data: criterion.map((criteria) => criteria.getData()),
                  skipDuplicates: true,
                },
              },
            }
          : {}),
      },
      include: { criterion: true },
    });
    rubricDataMapper(result, { aggregate });
  }
  async findById(id: string): Promise<RubricAggregate> {
    const rubric = await prisma.rubric.findUnique({
      where: { id },
      include: {
        criterion: true,
        copilotSession: {
          include: {
            project: {
              include: {
                copilotInput: {
                  include: {
                    goldenSet: true,
                    userInput: true,
                  },
                },
              },
            },
            copilotOutput: true,
            copilotServer: true,
          },
        },
      },
    });
    if (!rubric) {
      throw new Error(`Rubric with ID ${id} not found`);
    }
    return rubricDataMapper(rubric);
  }
}
