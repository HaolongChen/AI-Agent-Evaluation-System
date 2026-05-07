import { prisma } from "../../../../config/prisma.ts";
import { RubricAggregate } from "../../domain/aggregate/rubric.aggregate.js";
import {
  CriteriaEntity,
  RubricEntity,
} from "../../domain/entity/rubric.entity.js";
import type { IRubricRepository } from "../../domain/interface/rubric.interface.ts";

export class RubricRepository implements IRubricRepository {
  async getByGoldenSetIdAndUserInputId(
    goldenSetId: string,
    userInputId: string,
  ): Promise<RubricAggregate[]> {
    const rubrics = await prisma.rubric.findMany({
      where: { goldenSetId, userInputId },
      include: { criterion: true },
    });
    return rubrics.map((rubric) => {
      const rubricEntity = new RubricEntity(rubric, rubric.id);
      const rubricAggregate = new RubricAggregate(rubricEntity);
      for (const criterion of rubric.criterion) {
        const criteriaEntity = new CriteriaEntity(
          { ...criterion, weight: Number(criterion.weight) },
          criterion.id,
        );
        rubricAggregate.addCriteria(criteriaEntity);
      }
      return rubricAggregate;
    });
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
    await prisma.rubric.create({
      data: {
        ...rubricAggregate.data,
        id: rubricAggregate.id,
        criterion: {
          createMany: {
            data: rubricAggregate.criterion.map((criteria) => {
              return { ...criteria.data, id: criteria.id };
            }),
          },
        },
      },
    });
  }
  async getCriterionByRubricId(rubricId: string): Promise<CriteriaEntity[]> {
    const rubric = await prisma.rubric.findUnique({
      where: { id: rubricId },
      include: { criterion: true },
    });
    if (!rubric) {
      throw new Error(`Rubric with ID ${rubricId} not found`);
    }
    return rubric.criterion.map(
      (criteria) =>
        new CriteriaEntity(
          { ...criteria, weight: Number(criteria.weight) },
          criteria.id,
        ),
    );
  }
  async addCriterionToRubric(
    rubricId: string,
    criterion: CriteriaEntity,
  ): Promise<void> {
    await prisma.rubric.update({
      where: { id: rubricId },
      data: {
        criterion: {
          create: {
            ...criterion.data,
            id: criterion.id,
            weight: Number(criterion.data.weight),
          },
        },
      },
    });
  }
  async deleteCriterion(criterionId: string): Promise<void> {
    await prisma.criteria.delete({ where: { id: criterionId } });
  }
  async deleteRubric(rubricId: string): Promise<void> {
    await prisma.rubric.delete({ where: { id: rubricId } });
  }
  async save(entity: RubricEntity): Promise<void> {
    await prisma.rubric.create({ data: { ...entity.data, id: entity.id } });
  }
  async findById(id: string): Promise<RubricEntity> {
    const rubric = await prisma.rubric.findUnique({ where: { id } });
    if (!rubric) {
      throw new Error(`Rubric with ID ${id} not found`);
    }
    return new RubricEntity(rubric, rubric.id);
  }
}
