/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_processWithClaude from "../actions/processWithClaude.js";
import type * as alerts from "../alerts.js";
import type * as companyPolicies from "../companyPolicies.js";
import type * as complianceAnalysis from "../complianceAnalysis.js";
import type * as productSpecs from "../productSpecs.js";
import type * as regulationUpdates from "../regulationUpdates.js";
import type * as regulations from "../regulations.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/processWithClaude": typeof actions_processWithClaude;
  alerts: typeof alerts;
  companyPolicies: typeof companyPolicies;
  complianceAnalysis: typeof complianceAnalysis;
  productSpecs: typeof productSpecs;
  regulationUpdates: typeof regulationUpdates;
  regulations: typeof regulations;
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

export declare const components: {};
