export interface IProjectRepository
{

  save ( data: {exId: string, name: string, id: string}): Promise<void>;
  deleteById ( id: string ): Promise<void>;

  getExIdById ( id: string ): Promise<string>;
}
