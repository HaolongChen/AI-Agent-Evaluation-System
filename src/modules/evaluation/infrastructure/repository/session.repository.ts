import { prisma } from "../../../../config/prisma.ts";
import type { EvaluatorType } from "../../../../prisma/build/generated/prisma/client.ts";
import type { JsonValue } from "../../../../prisma/build/generated/prisma/internal/prismaNamespace.ts";
import type { RubricAggregate } from "../../../rubrics/domain/aggregate/rubric.aggregate.ts";
import {
  rubricDataMapper,
  type RubricDataMapperParameter,
  type RubricRepositoryType,
} from "../../../rubrics/infrastructure/repository/rubric.repository.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { EvaluationRecordAggregate } from "../../domain/aggregate/record.aggregate.ts";
import { EvaluationSessionAggregate } from "../../domain/aggregate/session.aggregate.ts";
import { EvaluationRecordEntity } from "../../domain/entity/record.entity.ts";
import { EvaluationSessionEntity } from "../../domain/entity/session.entity.ts";
import type { IEvaluationSessionRepository } from "../../domain/interface/session.interface.ts";

export type EvaluationRecordRepositoryType = {
  id: string;
  evaluatorType: EvaluatorType;
  rubricId: string;
  criteriaId: string;
  evaluatorId: string;
  evaluation: boolean;
  feedback: string | null;
  createdAt: Date;
};
export type EvaluationSessionRepositoryType = {
  evaluationRecords?: EvaluationRecordRepositoryType[];
  rubric?: RubricRepositoryType;
} & {
  id: string;
  rubricId: string;
  evaluatorType: EvaluatorType;
  evaluatorId: string;
  createdAt: Date;
  metadata: JsonValue | null;
  analysis: JsonValue | null;
};

export const evaluationRecordDataMapper = (
  record: EvaluationRecordRepositoryType,
  entity?: EvaluationRecordEntity,
): EvaluationRecordEntity => {
  return repositoryDateMapper(
    record,
    entity ?? new EvaluationRecordEntity(record, record.id, record),
  );
};

export type EvaluationSessionDataMapperParameter = {
  rubric?: { entity?: RubricDataMapperParameter; aggregate?: RubricAggregate };
  evaluationRecords?: EvaluationRecordEntity[];
};

export const evaluationSessionDataMapper = (
  session: EvaluationSessionRepositoryType,
  entity?: EvaluationSessionDataMapperParameter,
): EvaluationSessionAggregate => {
  const aggregate = new EvaluationSessionAggregate(
    repositoryDateMapper(
      session,
      new EvaluationSessionEntity(session, session.id),
    ),
  );
  const recordEntities = session.evaluationRecords
    ? session.evaluationRecords.map((record) =>
        evaluationRecordDataMapper(
          record,
          entity?.evaluationRecords?.find((r) => r.getData("id") === record.id),
        ),
      )
    : entity?.evaluationRecords;
  const rubricAggregate = session.rubric
    ? rubricDataMapper(session.rubric, entity?.rubric?.entity)
    : entity?.rubric?.aggregate;
  if (!rubricAggregate)
    throw new Error("Rubric data is required to map EvaluationSession");
  const recordAggregate = new EvaluationRecordAggregate(rubricAggregate);
  for (const record of recordEntities ?? []) {
    recordAggregate.evaluate(record);
  }
  aggregate.setEntity("rubric", recordAggregate);
  return aggregate;
};

export class EvaluationSessionRepository implements IEvaluationSessionRepository {
  async getByRubric(
    rubric: RubricAggregate,
  ): Promise<Array<EvaluationSessionAggregate>> {
    const evaluationSessions = await prisma.evaluationSession.findMany({
      where: {
        rubricId: rubric.getData("id"),
      },
      include: {
        evaluationRecords: true,
      },
    });
    return evaluationSessions.map((session) => {
      return evaluationSessionDataMapper(session, {
        rubric: { aggregate: rubric },
      });
    });
  }
  async save(entity: EvaluationSessionAggregate): Promise<void> {
    const records = entity.getEntity("rubric").getEntity("criterion");
    const result = await prisma.evaluationSession.create({
      data: {
        ...entity.getData(),
        rubric: {
          connect: { id: entity.getEntity("rubric").getData("id") },
        },
        ...(records.length > 0 && {
          evaluationRecords: {
            createMany: {
              data: records.map((record) => {
                return {
                  ...record.getEntity("evaluationRecord").getData(),
                  criteriaId: record.getData("id"),
                };
              }),
            },
          },
        }),
      },
      include: {
        evaluationRecords: true,
      },
    });
    evaluationSessionDataMapper(result, {
      rubric: { aggregate: entity.getEntity("rubric") },
      evaluationRecords: entity
        .getEntity("rubric")
        .getEntity("criterion")
        .map((c) => c.getEntity("evaluationRecord")),
    });
  }
  async findById(id: string): Promise<EvaluationSessionAggregate> {
    return evaluationSessionDataMapper(
      await prisma.evaluationSession.findUniqueOrThrow({
        where: { id },
        include: {
          evaluationRecords: true,
          rubric: {
            include: {
              copilotSession: {
                include: {
                  copilotInput: {
                    include: {
                      goldenSet: true,
                      userInput: true,
                    },
                  },
                  copilotOutput: true,
                  copilotServer: true,
                },
              },
              criterion: true,
            },
          },
        },
      }),
    );
  }
}
