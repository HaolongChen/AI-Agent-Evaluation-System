import { prisma } from "../../../../config/prisma.ts";
import type { Decimal } from "../../../../prisma/build/generated/prisma/internal/prismaNamespace.ts";
import type { CopilotSessionAggregate } from "../../../copilot-session/domain/aggregate/copilot-session.aggregate.ts";
import {
  copilotSessionDataMapper,
  type CopilotSessionDataMapperParameter,
  type CopilotSessionRepositoryType,
} from "../../../copilot-session/infrastructure/repository/copilot-session.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { RubricAggregate } from "../../domain/aggregate/rubric.aggregate.js";
import { CriteriaEntity } from "../../domain/entity/rubric.entity.js";
import type { IRubricRepository } from "../../domain/interface/rubric.interface.ts";

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
  copilotSession?: CopilotSessionRepositoryType;
};

export const criteriaDataMapper = (
  data: CriteriaRepositoryType,
  entity?: CriteriaEntity,
): CriteriaEntity => {
  return repositoryDateMapper(
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
};

export type RubricDataMapperParameter = {
  criterion?: CriteriaEntity[];
  copilotSession?: {
    aggregate?: CopilotSessionAggregate;
    entity?: CopilotSessionDataMapperParameter;
  };
};

export const rubricDataMapper = (
  data: RubricRepositoryType,
  entity?: RubricDataMapperParameter,
): RubricAggregate => {
  const criterion = data.criterion
    ? data.criterion.map((criteria) => criteriaDataMapper(criteria))
    : (entity?.criterion ?? []);
  const copilotSession = data.copilotSession
    ? copilotSessionDataMapper(
        data.copilotSession,
        entity?.copilotSession?.entity,
      )
    : entity?.copilotSession?.aggregate;
  if (!copilotSession) {
    throw new Error("Missing required copilotSession data for RubricAggregate");
  }
  const rubricAggregate = repositoryDateMapper(
    data,
    new RubricAggregate(copilotSession, data.id),
  );
  rubricAggregate.setEntity("criterion", criterion);
  return rubricAggregate;
};

export class RubricRepository implements IRubricRepository {
  async getByCopilotSession(
    copilotSession: CopilotSessionAggregate,
  ): Promise<Array<RubricAggregate>> {
    const rubrics = await prisma.rubric.findMany({
      where: {
        copilotSessionExId: copilotSession.getData("id"),
      },
      include: { criterion: true },
    });
    return rubrics.map((rubric) =>
      rubricDataMapper(rubric, {
        copilotSession: { aggregate: copilotSession },
      }),
    );
  }

  async addCriterionToRubric(
    rubricId: string,
    criterion: CriteriaEntity[],
  ): Promise<void> {
    const rubric = await prisma.rubric.update({
      where: { id: rubricId },
      data: {
        criterion: {
          createMany: {
            data: criterion.map((criteria) => {
              return criteria.getData();
            }),
          },
        },
      },
      include: { criterion: true },
    });
    rubricDataMapper(rubric, { criterion: criterion });
  }
  async deleteCriterion(criterionId: string): Promise<void> {
    await prisma.criteria.delete({ where: { id: criterionId } });
  }
  async deleteRubric(rubricId: string): Promise<void> {
    await prisma.rubric.delete({ where: { id: rubricId } });
  }
  async save(aggregate: RubricAggregate): Promise<void> {
    const data = await prisma.rubric.create({
      data: {
        ...aggregate.getData(),
        copilotSession: {
          connect: {
            id: aggregate.getEntity("copilotSession")[0].getData("id"),
          },
        },
        criterion: {
          createMany: {
            data: aggregate
              .getEntity("criterion")
              .map((criteria) => criteria.getData()),
          },
        },
      },
      include: { criterion: true },
    });
    rubricDataMapper(data, {
      criterion: aggregate.getEntity("criterion"),
      copilotSession: { aggregate: aggregate.getEntity("copilotSession")[0] },
    });
  }
  async findById(id: string): Promise<RubricAggregate> {
    const rubric = await prisma.rubric.findUnique({
      where: { id },
      include: {
        criterion: true,
        copilotSession: {
          include: {
            copilotInput: { include: { goldenSet: true, userInput: true } },
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
