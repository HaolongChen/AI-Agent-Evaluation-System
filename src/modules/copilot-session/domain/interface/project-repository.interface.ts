export interface IProjectRepository {
  save(data: {
    projectExId: string;
    projectName: string;
    id: string;
  }): Promise<void>;

  getExIdById(id: string): Promise<string>;
}
