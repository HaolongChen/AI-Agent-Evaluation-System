export interface IProjectRepositoryService {
  saveProjectExId(id: string, projectExId: string): Promise<void>;
  markProjectDeleted(projectExId: string): Promise<void>;
}
