import { Composition } from "remotion";
import { FPS } from "./theme";
import { Launch, LAUNCH_FRAMES } from "./compositions/Launch";

/** Square and English only: see the header of compositions/Launch.tsx. */
export const LaunchComposition: React.FC = () => (
  <Composition
    id="Launch-Square-EN"
    component={Launch}
    durationInFrames={LAUNCH_FRAMES}
    fps={FPS}
    width={1080}
    height={1080}
  />
);

export const LaunchRoot: React.FC = () => <LaunchComposition />;
