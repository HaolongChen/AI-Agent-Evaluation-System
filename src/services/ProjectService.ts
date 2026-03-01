import { prisma } from '../config/prisma.ts';
import { logger } from '../utils/logger.ts';

export class ProjectService {
  async createProject() {}

	async updateProject() { }
	
	async getProjectById(projectExId: string) {
		try {
      const project = await prisma.project.findUnique({
        where: {
          projectExId
        }
      });
      return project;
		} catch (error) {
      logger.error('Error retrieving project:', error);
      throw new Error('Failed to retrieve project');
		}
	}

  async getFreeProject() {}

  async acquireProject(projectExId: string) {
		try {
			const project = await this.getProjectById(projectExId);
			if (!project) {
				throw new Error('Project not found');
			}
			if (project.lock) {
				throw new Error('Project is currently locked');
			}
			const result = await prisma.project.update({
				where: {
					projectExId,
				},
				data: {
					lock: true,
				},
			});
			return result;
    } catch (error) {
      logger.error('Error acquiring project:', error);
      throw new Error('Failed to acquire project');
    }
  }

  async releaseProject(projectExId: string) {
		try {
			const project = await this.getProjectById(projectExId);
			if (!project) {
				throw new Error('Project not found');
			}
			if(!project.lock) {
				throw new Error('Project is not locked');
			}
			const result = await prisma.project.update({
				where: {
					projectExId,
				},
				data: {
					lock: false,
				},
			});
			return result;
    } catch (error) {
      logger.error('Error releasing project:', error);
      throw new Error('Failed to release project');
    }
  }

  async deleteProject() {}
}

export const projectService = new ProjectService();
