# Account Module

## OVERVIEW

Functorz backend auth: login via phone/username, token management with 1-hour TTL, GQL/WS client lifecycle.

## STRUCTURE

```
domain/
  entity/          AccountEntity (extends Entity<T>)
  interface/       ILoginService (contract for login mutations)
  schema/          account.schema.ts (phoneNumber, password, AccountInfo)
  service/         AccountService (login state, token TTL management)
application/
  account-handler.ts  Account class (extends AccountService, manages GQL/WS clients)
infrastructure/
  login.ts         GraphQL mutations for login (phone + username variants)
```

**Note**: No `aggregate/` or `infrastructure/repository/` — account has no DB persistence, no `IAccountRepository`.

## KEY COMPONENTS

**AccountEntity** — Auth credential holder. Stores phone/password, manages AccountInfo (accessToken, exId) lifecycle.

**AccountService** — Login state machine. `handleLogin()` sets token + starts 1-hour TTL. `isLoggedIn` guards auth.

**Account** (extends AccountService) — Primary facade: `login()`, `ensureLoggedIn()`, `getGQLClient()`, `getWsClient()`, `clearWsClient()`, `setAccessToken()`, `sessionId`.

## DI

`src/DI/account.ts` exports `createAccount()`, `getMyAccount()`, `getDangerousAccount()` factories.

**Known violation**: These factories read `process.env.FUNCTORZ_PHONE_NUMBER`, `FUNCTORZ_PASSWORD`, `DANGEROUS_USERNAME`, `DANGEROUS_PASSWORD` directly. Must use `src/config/` instead — see `src/modules/AGENTS.md` anti-patterns.

## CONVENTIONS

- Token TTL is 1 hour (3_600_000ms), auto-cleared on expiry
- WS clients must be cleared before re-authentication
- Login supports phone numbers (+prefix/digits) and usernames
- `infrastructure/login.ts` imports `publicNetworkClient` singleton from `shared/application/graphql-client.ts`
