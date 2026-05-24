import { prisma } from "../../../../config/prisma.ts";
import type { Decimal } from "../../../../prisma/build/generated/prisma/internal/prismaNamespace.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { RubricAggregate } from "../../domain/aggregate/rubric.aggregate.js";
import {
  CriteriaEntity,
  RubricEntity,
} from "../../domain/entity/rubric.entity.js";
import type { IRubricRepository } from "../../domain/interface/rubric.interface.ts";

interface Criteria {
  id: string;
  createdAt: Date;
  rubricId: string;
  content: string;
  expectedAnswer: boolean;
  weight: Decimal;
  reasoning: string | null;
}

interface Rubric {
  id: string;
  goldenSetId: string;
  userInputId: string;
  createdAt: Date;
  criterion: Criteria[];
}
export class RubricRepository implements IRubricRepository {
  private buildCriteriaEntity(criteria: Criteria): CriteriaEntity {
    return repositoryDateMapper(
      criteria,
      new CriteriaEntity(
        {
          ...criteria,
          weight: Number(criteria.weight),
          reasoning: criteria.reasoning ?? undefined,
        },
        criteria.id,
      ),
    );
  }
  private buildRubricAggregate(rubric: Rubric): RubricAggregate {
    const rubricAggregate = new RubricAggregate(
      repositoryDateMapper(rubric, new RubricEntity(rubric, rubric.id)),
    );
    for (const criteria of rubric.criterion) {
      rubricAggregate.pushEntity(
        "criterion",
        this.buildCriteriaEntity(criteria),
      );
    }
    return rubricAggregate;
  }

  async getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<RubricAggregate[]> {
    const rubrics = await prisma.rubric.findMany({
      where: { goldenSetId, userInputId },
      include: { criterion: true },
    });
    return rubrics.map((rubric) => this.buildRubricAggregate(rubric));
  }
  async linkRubricToCopilotOutput(
    rubricId: string,
    copilotOutputId: string,
  ): Promise<void> {
    await prisma.copilotOutput_rubric.create({
      data: {
        copilotOutput: { connect: { id: copilotOutputId } },
        rubric: { connect: { id: rubricId } },
      },
    });
  }
  async saveWithCriterion(rubricAggregate: RubricAggregate): Promise<void> {
    const rubric = await prisma.rubric.create({
      data: {
        ...rubricAggregate.getData(),
        criterion: {
          createMany: {
            data: rubricAggregate
              .getEntity("criterion")
              .map((criteria) => criteria.getData()),
          },
        },
      },
      include: { criterion: true },
    });
    this.buildRubricAggregate(rubric);
  }
  async getCriterionByRubricId(rubricId: string): Promise<CriteriaEntity[]> {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { criterion: true },
    });
    if (!rubric) {
      throw new Error(`Rubric with ID ${rubricId} not found`);
    }
    return rubric.criterion.map((criteria) =>
      this.buildCriteriaEntity(criteria),
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
    this.buildRubricAggregate(rubric);
  }
  async deleteCriterion(criterionId: string): Promise<void> {
    await prisma.criteria.delete({ where: { id: criterionId } });
  }
  async deleteRubric(rubricId: string): Promise<void> {
    await prisma.rubric.delete({ where: { id: rubricId } });
  }
  async save(entity: RubricEntity): Promise<void> {
    const rubric = await prisma.rubric.create({
      data: entity.getData(),
    });
    repositoryDateMapper(rubric, entity);
  }
  async findById(id: string): Promise<RubricAggregate> {
    const rubric = await prisma.rubric.findUnique({
      where: { id },
      include: { criterion: true },
    });
    if (!rubric) {
      throw new Error(`Rubric with ID ${id} not found`);
    }
    return this.buildRubricAggregate(rubric);
  }
}
