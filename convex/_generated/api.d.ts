/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agenda from "../agenda.js";
import type * as analytics from "../analytics.js";
import type * as dashboard from "../dashboard.js";
import type * as health from "../health.js";
import type * as invitations from "../invitations.js";
import type * as matches from "../matches.js";
import type * as media from "../media.js";
import type * as riotApi from "../riotApi.js";
import type * as scouting from "../scouting.js";
import type * as scrims from "../scrims.js";
import type * as seed from "../seed.js";
import type * as tasks from "../tasks.js";
import type * as teams from "../teams.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agenda: typeof agenda;
  analytics: typeof analytics;
  dashboard: typeof dashboard;
  health: typeof health;
  invitations: typeof invitations;
  matches: typeof matches;
  media: typeof media;
  riotApi: typeof riotApi;
  scouting: typeof scouting;
  scrims: typeof scrims;
  seed: typeof seed;
  tasks: typeof tasks;
  teams: typeof teams;
  users: typeof users;
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

export declare const components: {};
