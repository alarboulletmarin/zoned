/** `import text from "./file.svg?raw"`: the file's source as a string (see remotion.config.ts). */
declare module "*.svg?raw" {
  const source: string;
  export default source;
}
