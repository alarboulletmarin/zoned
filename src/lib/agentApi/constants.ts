/**
 * Agent API, shared constants.
 *
 * Everything under `src/lib/agentApi/` is pure: no React, no i18next, no
 * storage. The build script (`scripts/generate-agent-api.ts`), the
 * `/plan/import` page and a future MCP server all import it as is, so the
 * contract an agent reads is the one the app enforces.
 */

export const SITE_URL = "https://zoned.run";

/** Major version of the public contract. v1 only ever gains fields. */
export const AGENT_API_VERSION = "v1";

/** Path prefix the static resources are written under, in `dist/`. */
export const AGENT_API_PATH = `/api/${AGENT_API_VERSION}`;

export const AGENT_API_BASE = `${SITE_URL}${AGENT_API_PATH}`;

/** The import route an agent hands the user. */
export const PLAN_IMPORT_PATH = "/plan/import";

/** Version of the `/plan/import` payload, carried in the payload itself. */
export const PLAN_IMPORT_VERSION = 1;

export const CONTENT_LICENSE = {
  id: "CC-BY-4.0",
  name: "Creative Commons Attribution 4.0 International",
  url: "https://creativecommons.org/licenses/by/4.0/",
  attribution: "Zoned (https://zoned.run)",
} as const;

export const CODE_LICENSE = {
  id: "MIT",
  url: "https://github.com/alarboulletmarin/zoned/blob/develop/LICENSE",
} as const;

export const workoutPageUrl = (id: string): string => `${SITE_URL}/workout/${id}`;
export const workoutJsonUrl = (id: string): string => `${AGENT_API_BASE}/workouts/${id}.json`;
export const prebuiltPlanPageUrl = (slug: string): string => `${SITE_URL}/plan/prebuilt/${slug}`;
export const prebuiltPlanJsonUrl = (slug: string): string =>
  `${AGENT_API_BASE}/plans/prebuilt/${slug}.json`;
