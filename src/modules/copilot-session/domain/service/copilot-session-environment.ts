import type { ProjectEntity } from "../entity/project.entity.ts";
import type { ICopilotSessionSetupFactory } from "../interface/copilot-session-setup.interface.ts";

export class CopilotSessionEnvironment
{
  constructor ( private copilotSessionSetupFactory: ICopilotSessionSetupFactory ) {}

  async setupEnvironment ( project: ProjectEntity )
  {
    const copilotSessionSetup = this.copilotSessionSetupFactory.build( project.getData( "projectExId" ) );
  }
}