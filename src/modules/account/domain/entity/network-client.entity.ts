import type { z } from "zod";
import {
  AUTHORIZATION_HEADER_KEY,
  GRAPHQL_HEADER_KEYS,
  networkClientSchema,
  SESSION_ID_HEADER_KEY,
  WEBSOCKET_HEADER_KEYS,
  ZED_VERSION_HEADER_KEY,
  type HeaderKeyFrom,
  type NetworkClientHeaders,
} from "../schema/network-client.schema.ts";
import {
  Entity,
  type EntityMetadata,
} from "../../../shared/domain/entity/entity.ts";
import { logger } from "../../../shared/infrastructure/logger.ts";

export class NetworkClientEntity extends Entity<
  typeof networkClientSchema,
  NetworkClientHeaders & EntityMetadata
> {
  private getHeaderKeyBundle<T extends keyof NetworkClientHeaders>(
    key: T,
  ): HeaderKeyFrom<T> {
    if (key in ZED_VERSION_HEADER_KEY) {
      return ZED_VERSION_HEADER_KEY as HeaderKeyFrom<T>;
    } else if (key in SESSION_ID_HEADER_KEY) {
      return SESSION_ID_HEADER_KEY as HeaderKeyFrom<T>;
    } else if (key in AUTHORIZATION_HEADER_KEY) {
      return AUTHORIZATION_HEADER_KEY as HeaderKeyFrom<T>;
    } else {
      throw new Error(`Unsupported header key: ${key}`);
    }
  }
  constructor(data: z.input<typeof networkClientSchema>, id?: string) {
    super(data, networkClientSchema, { id } as EntityMetadata &
      NetworkClientHeaders);
    // Default Configuration
    this.setHeader("X-Zed-Version", "2.0.7");
  }

  static createDefault() {
    return new NetworkClientEntity({});
  }

  public setHeader<T extends keyof NetworkClientHeaders>(
    key: T,
    value: string,
  ) {
    const headerKeyBundle = this.getHeaderKeyBundle(key);
    Object.values(headerKeyBundle).map((realKey) =>
      this.setData({ [realKey]: value } as Record<
        keyof NetworkClientHeaders,
        string
      >),
    );
  }

  public setGraphQLUrl(url: string) {
    if (url === this.getData("gqlUrl")) {
      return;
    }
    this.setData({ gqlUrl: url });
  }

  public setWebSocketUrl(url: string) {
    if (url === this.getData("wsUrl")) {
      return;
    }
    this.setData({ wsUrl: url });
  }

  public getUrlAndHeaderForGraphQL() {
    const result = {} as {
      [K in (typeof GRAPHQL_HEADER_KEYS)[number]]: string;
    };
    for (const key of GRAPHQL_HEADER_KEYS) {
      const value = this.getData(key);
      if (!value) {
        logger.info(
          `Header ${key} is not set in NetworkClientEntity`,
          this.getData(),
        );
      }
      result[key] = key === "Authorization" ? `Bearer ${value}` : value || "";
    }

    return { headers: result, url: this.getData("gqlUrl") };
  }

  public getUrlAndHeaderForWebSocket() {
    const result = {} as {
      [K in (typeof WEBSOCKET_HEADER_KEYS)[number]]: string;
    };
    for (const key of WEBSOCKET_HEADER_KEYS) {
      const value = this.getData(key);
      if (!value) {
        logger.info(
          `Header ${key} is not set in NetworkClientEntity`,
          this.getData(),
        );
      }
      result[key] = value || "";
    }
    return { headers: result, url: this.getData("wsUrl") };
  }
}
