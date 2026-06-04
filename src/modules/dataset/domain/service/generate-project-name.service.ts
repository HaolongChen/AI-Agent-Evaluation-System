import type { CopilotInputAggregate } from "../aggregate/copilot-input.aggregate.ts";
import type { GoldenSetEntity } from "../entity/golden-set.entity.ts";
import type { UserInputEntity } from "../entity/user-input.entity.ts";

export class ProjectNameService
{
  private maxLength: number = 50;
  private maxRetry: number = 3;
  private lastProjectName: string | undefined;
  private goldenSet: GoldenSetEntity;
  private userInput: UserInputEntity
  constructor ( copilotInput: CopilotInputAggregate )
  {
    this.goldenSet = copilotInput.getEntity( "goldenSet" );
    this.userInput = copilotInput.getEntity( "userInput" );
  }

  private truncate ( name: string, length: number = this.maxLength ): string
  {
    if ( name.length <= length ) { return name; }
    return name.slice( 0, length );
  }

  generateProjectName (): string
  {
    const goldenSetId = this.goldenSet.getData( "id" );
    const userInputId = this.userInput.getData("id");
    this.lastProjectName = this.truncate(`temp-project-${goldenSetId[0]}-${userInputId[0]}-${Date.now()}`);
    return this.lastProjectName;
  }

  retry (): string
  {
    if( this.maxRetry <= 0 )    {
      throw new Error( "Maximum retry attempts reached for project name generation." );
    }
    if( !this.lastProjectName )    {
      throw new Error( "No project name generated yet. Please call generateProjectName() first." );
    }
    this.lastProjectName = this.truncate(`${this.truncate(this.lastProjectName, this.lastProjectName.length / 4)}-retry-${Date.now()}`);
    this.maxRetry--;
    return this.lastProjectName;
  }
}

export class ProjectNameServiceFactory
{
  initializeByCopilotInput ( copilotInput: CopilotInputAggregate ): ProjectNameService
  {
    return new ProjectNameService( copilotInput );
  }
}