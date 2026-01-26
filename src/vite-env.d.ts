/// <reference types="vite/client" />

declare module "*.svg?react" {
  import { FunctionComponent, SVGProps } from "react";
  const content: FunctionComponent<SVGProps<SVGElement>>;
  export default content;
}
