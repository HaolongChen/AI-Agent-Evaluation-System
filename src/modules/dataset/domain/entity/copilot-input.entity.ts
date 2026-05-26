export class CopilotInputEntity extends Entity<typeof copilotInputSchema>{
  constructor(data: z.infer<typeof copilotInputSchema>, id?: string){
    super(data, copilotInputSchema, id)
  }

}