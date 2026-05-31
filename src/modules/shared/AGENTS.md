# Shared DDD Module

## OVERVIEW

Foundational DDD building blocks (Entity, AggregateRoot, ValueObject, IRepository) + cross-cutting infrastructure (GQL/WS client, LLM providers, logger, Ali OSS).

## DOMAIN LAYER

**Entity** (`domain/entity/entity.ts`): `Entity<T, M>` base with UUID, createdAt/updatedAt, Zod validation, `getData()` accessor. Constructor overloading for clone or raw init. Cross-layer violation: imports logger from `infrastructure/logger.ts`.

**NetworkClientEntity** (`domain/entity/network-client.entity.ts`): Entity wrapping GQL/WS connection config (headers, URLs). Same cross-layer violation (imports logger).

**AggregateRoot** (`domain/aggregate/aggregate-root.ts`): `AggregateRoot<T, M>` wraps Entity for consistency boundaries. Same logger violation.

**ValueObject** (`domain/value-object/base.vo.ts`): `ValueObject<T>` for immutable Zod-validated wrappers.

**Repository** (`domain/interface/repository.interface.ts`): `IRepository<T>` contract.

**GQL/WS interfaces** (`domain/interface/`): `IGQLClient` + `IWebSocketClient` + subscription handler types.

**Graph states** (`domain/interface/graph-states.ts`): LangGraph types (`JobState`, `RuntimeContext`, etc.) — misplaced in domain, should live in application layer.

**Zed types** (`domain/interface/type-system.ts`): Barrel re-export from `@functorz/ztype`.

**Type system service** (`domain/service/type-system.service.ts`): Functorz Zed type utilities. 6 `any` violations (lines 47, 49, 65, 81, 215, 238) — known tech debt.

## APPLICATION LAYER

- **graphql-client.ts**: `GQLClient` class implementing `IGQLClient`. Uses `NetworkClientEntity` for headers/URL, wraps `graphql-request`.
- **websocket-client.ts**: `WebSocketClient` class implementing `IWebSocketClient`. Uses `NetworkClientEntity`, wraps `subscriptions-transport-ws`. Reconnect logic built in.

Used by account module (`login.ts`, `account-handler.ts`).

## INFRASTRUCTURE

- **repository.ts**: `repositoryDateMapper()` hydrates DB timestamps.
- **logger.ts**: tslog structured logger. Imported by every module.
- **ali-oss.ts**: Aliyun OSS client for cloud storage.
- **llm-providers.ts**: Provider abstraction (OpenAI, Gemini, Azure OpenAI).

## NOTES

- No barrel exports. Imports reference internal files directly.
- `src/external/` does not exist on disk (phantom dir from docs).
