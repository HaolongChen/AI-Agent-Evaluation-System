# Account Module

## OVERVIEW

Functorz backend authentication: login via phone/username, token management with 1-hour TTL, GQL/WS client lifecycle.

## STRUCTURE

```
domain/
  entity/          AccountEntity (extends Entity<T>)
  schema/          account.schema.ts (phoneNumber, password, AccountInfo)
  service/         AccountService (login state, token TTL management)
application/
  account-handler.ts  Account class (extends AccountService, manages GQL/WS clients)
infrastructure/
  login.ts         GraphQL mutations for login (phone + username variants)
```

**Note**: Simpler than other modules — no `interface/`, `aggregate/`, or `infrastructure/repository/` directories.

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

`src/DI/account.ts` exports a `createAccount()` factory function that creates `Account` instances at startup:

- `createAccount(phoneNumberOrUsername, password)` — Creates + initializes a new Account
- `getMyAccount()` — Convenience wrapper using `FUNCTORZ_PHONE_NUMBER`/`FUNCTORZ_PASSWORD`
- `getDangerousAccount()` — Convenience wrapper using `DANGEROUS_USERNAME`/`DANGEROUS_PASSWORD`

## CONVENTIONS

- Login supports both phone numbers (+prefix or digits) and usernames
- Token TTL is 1 hour (3_600_000ms), auto-cleared on expiry
- WS clients must be cleared before re-authentication to avoid stale connections
- **No repository pattern**: Account module does NOT follow `IRepository<T>` — no DB persistence, no `IAccountRepository`
- `infrastructure/login.ts` imports `publicNetworkClient` singleton from `shared/application/graphql-client.ts` directly (not through the Account class)
