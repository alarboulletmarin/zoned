// NOTE: CommandPalette is intentionally NOT re-exported here. It drags the
// whole search index (workouts, collections, command surfaces) with it, so
// App.tsx code-splits it via a direct dynamic import. Re-exporting it from
// this barrel would pull it back into the entry chunk through TopBar's
// static import of useCommandPalette.
export { CommandPaletteProvider, useCommandPalette } from "./CommandPaletteProvider";
