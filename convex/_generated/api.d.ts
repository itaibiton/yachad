/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_validators from "../lib/validators.js";
import type * as modules_alerts_queries from "../modules/alerts/queries.js";
import type * as modules_chat_mutations from "../modules/chat/mutations.js";
import type * as modules_chat_queries from "../modules/chat/queries.js";
import type * as modules_feed_mutations from "../modules/feed/mutations.js";
import type * as modules_feed_queries from "../modules/feed/queries.js";
import type * as modules_flights_mutations from "../modules/flights/mutations.js";
import type * as modules_flights_queries from "../modules/flights/queries.js";
import type * as modules_news_actions from "../modules/news/actions.js";
import type * as modules_news_mutations from "../modules/news/mutations.js";
import type * as modules_news_queries from "../modules/news/queries.js";
import type * as modules_reservations_mutations from "../modules/reservations/mutations.js";
import type * as modules_reservations_queries from "../modules/reservations/queries.js";
import type * as modules_storage_mutations from "../modules/storage/mutations.js";
import type * as modules_users_mutations from "../modules/users/mutations.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  http: typeof http;
  "lib/auth": typeof lib_auth;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/validators": typeof lib_validators;
  "modules/alerts/queries": typeof modules_alerts_queries;
  "modules/chat/mutations": typeof modules_chat_mutations;
  "modules/chat/queries": typeof modules_chat_queries;
  "modules/feed/mutations": typeof modules_feed_mutations;
  "modules/feed/queries": typeof modules_feed_queries;
  "modules/flights/mutations": typeof modules_flights_mutations;
  "modules/flights/queries": typeof modules_flights_queries;
  "modules/news/actions": typeof modules_news_actions;
  "modules/news/mutations": typeof modules_news_mutations;
  "modules/news/queries": typeof modules_news_queries;
  "modules/reservations/mutations": typeof modules_reservations_mutations;
  "modules/reservations/queries": typeof modules_reservations_queries;
  "modules/storage/mutations": typeof modules_storage_mutations;
  "modules/users/mutations": typeof modules_users_mutations;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
