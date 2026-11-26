/**
 * Agent API: the static, read-only contract AI agents use to read the
 * catalogue and hand a plan back through `/plan/import`.
 *
 * Contract: docs/agent-api.md. Writer: scripts/generate-agent-api.ts.
 * Reader in the app: src/pages/PlanImportPage.tsx. Kept free of React,
 * i18next and storage so a future MCP server can import it unchanged.
 */

export * from "./constants";
export * from "./catalogue";
export * from "./resources";
export * from "./importPayload";
export * from "./importLink";
export * from "./importParams";
export * from "./messages";
export * from "./schema";
