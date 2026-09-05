import { Fragment } from "react";
import { Composition } from "remotion";
import { DIMENSIONS, FPS, type Format } from "./theme";
import { LANGS, langTag } from "./lang";
import { Teaser, TEASER_FRAMES } from "./compositions/Teaser";
import { Spot, SPOT_FRAMES } from "./compositions/Spot";
import { Overview, OVERVIEW_FRAMES } from "./compositions/Overview";
import { FeatureDemo, FEATURE_IDS, FEATURE_FRAMES } from "./compositions/FeatureDemo";

/**
 * Every film is registered once per format and once per language: twelve films
 * × two cuts × two languages = 48 compositions.
 *
 * The compositions themselves never read the format: `useLayout()` derives it
 * from the canvas, so a single component tree serves both the 16:9 and the 9:16
 * cut. The language is the one thing they are told, because nothing about the
 * canvas can reveal it — it arrives as a prop, is published by `<Stage>`, and
 * every leaf reads it with `useLang()`.
 *
 * Both dimensions are separate compositions rather than props on one, for the
 * same two reasons: all 48 stay previewable in the studio, and all 48 are
 * renderable by id.
 *
 * Ids read `<Film>-<Format>-<LANG>`: `Overview-Wide-FR`, `Feature-Science-Story-EN`.
 * The language is spelled out on both, French included — an unsuffixed default
 * would make one language look like the real one and the other like an export.
 */

const FORMATS: Format[] = ["wide", "story"];

const suffix = (format: Format) => (format === "wide" ? "Wide" : "Story");

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const RemotionRoot: React.FC = () => (
  <>
    {LANGS.map((lang) =>
      FORMATS.map((format) => {
        const size = DIMENSIONS[format];
        const tag = `${suffix(format)}-${langTag(lang)}`;

        return (
          <Fragment key={`${lang}-${format}`}>
            <Composition
              id={`Teaser-${tag}`}
              component={Teaser}
              durationInFrames={TEASER_FRAMES}
              fps={FPS}
              defaultProps={{ lang }}
              {...size}
            />
            <Composition
              id={`Spot-${tag}`}
              component={Spot}
              durationInFrames={SPOT_FRAMES}
              fps={FPS}
              defaultProps={{ lang }}
              {...size}
            />
            <Composition
              id={`Overview-${tag}`}
              component={Overview}
              durationInFrames={OVERVIEW_FRAMES}
              fps={FPS}
              defaultProps={{ lang }}
              {...size}
            />
            {FEATURE_IDS.map((feature) => (
              <Composition
                key={feature}
                id={`Feature-${capitalise(feature)}-${tag}`}
                component={FeatureDemo}
                durationInFrames={FEATURE_FRAMES}
                fps={FPS}
                defaultProps={{ feature, lang }}
                {...size}
              />
            ))}
          </Fragment>
        );
      }),
    )}
  </>
);
