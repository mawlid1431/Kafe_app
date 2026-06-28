/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as catalog from "../catalog.js";
import type * as orders from "../orders.js";
import type * as promos from "../promos.js";
import type * as lib_orderPricing from "../lib/orderPricing.js";
import type * as lib_orderRules from "../lib/orderRules.js";
import type * as adminDashboard from "../adminDashboard.js";
import type * as admins from "../admins.js";
import type * as branches from "../branches.js";
import type * as customersAdmin from "../customersAdmin.js";
import type * as health from "../health.js";
import type * as lib_adminAuth from "../lib/adminAuth.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_password from "../lib/password.js";
import type * as menuAdmin from "../menuAdmin.js";
import type * as ordersAdmin from "../ordersAdmin.js";
import type * as promosAdmin from "../promosAdmin.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  adminDashboard: typeof adminDashboard;
  admins: typeof admins;
  branches: typeof branches;
  catalog: typeof catalog;
  customersAdmin: typeof customersAdmin;
  health: typeof health;
  "lib/adminAuth": typeof lib_adminAuth;
  "lib/auth": typeof lib_auth;
  "lib/orderPricing": typeof lib_orderPricing;
  "lib/orderRules": typeof lib_orderRules;
  "lib/password": typeof lib_password;
  menuAdmin: typeof menuAdmin;
  orders: typeof orders;
  ordersAdmin: typeof ordersAdmin;
  promos: typeof promos;
  promosAdmin: typeof promosAdmin;
  seed: typeof seed;
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
