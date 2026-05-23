import { prisma } from "../../../../config/prisma.ts";
import type { projectWhereUniqueInput } from "../../../../prisma/build/generated/prisma/models.ts";
import { repositoryDateMapper } from "../../../shared/infrastructure/repository.ts";
import { ProjectEntity } from "../../domain/entity/project.entity.ts";
import {
  ProjectIdentifiers,
  type IProjectRepository,
} from "../../domain/interface/project.interface.ts";

export class ProjectRepository implements IProjectRepository {
  async deleteById(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
  async save(data: ProjectEntity) {
    const project = await prisma.project.create({
      data: data.getData(),
    });
    repositoryDateMapper(project, data);
  }

  async findById(id: string): Promise<ProjectEntity> {
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new Error(`Project with ID ${id} not found`);
    }
    return repositoryDateMapper(
      project,
      new ProjectEntity(project, project.id),
    );
  }

  async getByUniqueField<T extends ProjectIdentifiers>(
    field: T,
    value: string,
  ): Promise<ProjectEntity> {
    const whereClause = {
      [field]: value,
    } as unknown as projectWhereUniqueInput;
    const project = await prisma.project.findUnique({ where: whereClause });
    if (!project) {
      throw new Error(`Project with ${field} ${value} not found`);
    }
    return repositoryDateMapper(
      project,
      new ProjectEntity(project, project.id),
    );
  }
}
