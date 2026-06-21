import type { RepositoryInjectionType } from "../DI/repository.ts";
import type { ApplicationServiceBundle, InfrastructureServiceBundle } from "../DI/service.ts";
import type { Account } from "../modules/account/domain/entity/account.entity.ts";
import type { IDomainEventBus } from "../modules/shared/domain/event/domain-event.bus.ts";

export interface GraphQLContext
{
  copilotSessionEventBus: IDomainEventBus;
  account: Account;
  repositoryBundle: RepositoryInjectionType;
  infrastructureServiceBundle: InfrastructureServiceBundle;
  applicationServiceBundle: ApplicationServiceBundle;
}