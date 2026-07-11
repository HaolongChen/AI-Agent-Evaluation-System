import { z } from "zod";

export const networkClientSchema = z.object({
  // headers: z.record( z.string(), z.string() ),
  wsUrl: z.url().default(process.env.SUBSCRIPTION_GRAPHQL_URL),
  gqlUrl: z.url().default(process.env.BACKEND_GRAPHQL_URL),
});

export const ZED_VERSION_HEADER_KEY = {
  "X-Zed-Version": "X-Zed-Version",
  "X-ZED-VERSION": "X-ZED-VERSION",
} as const;

export const SESSION_ID_HEADER_KEY = {
  "X-Session-Id": "X-Session-Id",
  "X-SESSION-ID": "X-SESSION-ID",
} as const;

export const AUTHORIZATION_HEADER_KEY = {
  Authorization: "Authorization",
  authToken: "authToken",
} as const;

export const GRAPHQL_HEADER_KEYS = [
  "Authorization",
  "X-Session-Id",
  "X-Zed-Version",
] as const;

export const WEBSOCKET_HEADER_KEYS = [
  "authToken",
  "X-SESSION-ID",
  "X-ZED-VERSION",
] as const;

export type ZedVersionPresentation = keyof typeof ZED_VERSION_HEADER_KEY;
export type SessionIdPresentation = keyof typeof SESSION_ID_HEADER_KEY;
export type AuthorizationPresentation = keyof typeof AUTHORIZATION_HEADER_KEY;
export type NetworkClientHeaders = {
  [
    key in
      ZedVersionPresentation | SessionIdPresentation | AuthorizationPresentation
  ]: string | undefined;
};

export type HeaderKeyFrom<T extends keyof NetworkClientHeaders> =
  T extends ZedVersionPresentation
    ? typeof ZED_VERSION_HEADER_KEY
    : T extends SessionIdPresentation
      ? typeof SESSION_ID_HEADER_KEY
      : T extends AuthorizationPresentation
        ? typeof AUTHORIZATION_HEADER_KEY
        : never;
