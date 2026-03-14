export type { ChangelogVersion, ChangelogItem, ChangeType } from "./types";
export { changelogVersions } from "./data";

import { changelogVersions } from "./data";
import type { ChangelogVersion } from "./types";

export function getLatestVersion(): ChangelogVersion {
  return changelogVersions[0];
}

export function getLatestVersionString(): string {
  return changelogVersions[0].version;
}
