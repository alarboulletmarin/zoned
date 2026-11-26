# Docs

Notes for people working on Zoned. The user-facing story is in the [README](../README.md).

## Reference (English)

| Page | What it covers |
|---|---|
| [workout-format.md](workout-format.md) | how a session is written in JSON, and what the validator checks |
| [agent-api.md](agent-api.md) | the static JSON API, `llms.txt` and the plan import link |

## Design notes (French)

Each one settles what a screen shows and why, so the next change does not replay those decisions. Read the matching one before touching that screen.

| Page | Screen or topic |
|---|---|
| [aujourdhui.md](aujourdhui.md) | `/today`, the cockpit: what it follows |
| [anneaux.md](anneaux.md) | the week's rings on the cockpit |
| [plans.md](plans.md) | `/plans` |
| [seance.md](seance.md) | `/workout/:id`, the session page, and Add to |
| [bibliotheque.md](bibliotheque.md) | `/library`: rows, families, filters, URL parameters |
| [calculateurs.md](calculateurs.md) | the calculators and race day |
| [pratiques.md](pratiques.md) | road and trail, and why triathlon is out |
| [activites-complementaires.md](activites-complementaires.md) | activities outside the plan (a bike commute...) and how they count in the load |
| [doodles.md](doodles.md) | the drawings: line, rules, where they go |
| [icon-mapping.md](icon-mapping.md) | the icon set and its generator |

`design/` holds the reference mock-ups (`*.reference.html`) the notes point to.
