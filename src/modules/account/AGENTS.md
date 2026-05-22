# Account Module

## OVERVIEW

Functorz backend authentication: login via phone/username, token management with 1-hour TTL, GQL/WS client lifecycle.

## STRUCTURE

```
domain/
  entity/          AccountEntity (extends Entity<T>)
  schema/          account.schema.ts (phoneNumber, password, AccountInfo interface)
  service/         AccountService (login state, token TTL management)
application/
  account-handler.ts  Account class (extends AccountService, manages GQL/WS clients)
infrastructure/
  login.ts         GraphQL mutations for login (phone + username variants)
```

## ENTITIES

**AccountEntity** — Auth credential holder. Stores phoneNumber/password, manages AccountInfo (accessToken, account.exId) with set/clear lifecycle.

## DOMAIN SERVICES

**AccountService** — Login state machine. `handleLogin()` sets token + starts 1-hour TTL timeout. `isLoggedIn` flag guards authenticated operations.

## APPLICATION

**Account** (extends AccountService) — Primary auth facade:

- `login()` — Calls infrastructure login, sets token via `handleLogin()`
- `ensureLoggedIn()` — Auto-login if not authenticated
- `getGQLClient()` — Returns graphql-request client with Bearer auth
- `getWsClient()` — Returns WebSocket client with Bearer auth
- `clearWsClient()` — Closes and resets WS connection
- `setAccessToken()` — Manual token injection (for external auth flows)
- `sessionId` — UUID per Account instance, sent as `X-Session-Id` header

## DI

`src/DI/account.ts` exports two pre-configured instances:

- `myAccount` — Primary account (FUNCTORZ_PHONE_NUMBER/FUNCTORZ_PASSWORD)
- `dangerousAccount` — Secondary account (DANGEROUS_USERNAME/DANGEROUS_PASSWORD)

Both initialized at server startup in `src/index.ts`.

## CONVENTIONS

- Login supports both phone numbers (+prefix or digits) and usernames
- Token TTL is 1 hour (3_600_000ms), auto-cleared on expiry
- WS clients must be cleared before re-authentication to avoid stale connections
- Account imports from `shared/application/graphql-client.ts` for NetworkClient
