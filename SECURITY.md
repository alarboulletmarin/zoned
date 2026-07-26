# Security Policy

## Supported versions

Zoned is a static, continuously deployed web app: [zoned.run](https://zoned.run)
always runs the latest commit on `main`. Only that version is supported — there
are no long-lived release branches to backport fixes to.

## Threat model in one paragraph

Zoned has **no backend, no user accounts and no database**. The whole app is a
static bundle served from a CDN, and all user data (zones, plans, favorites,
custom workouts, profile, routes) lives in the browser's `localStorage`. There
is no server-side state to breach and no credentials to steal. The only feature
that sends anything off-device is the **route generator**, which is opt-in in
Settings and queries the public Overpass and elevation APIs with coordinates you
provide.

That shape rules out most classic web vulnerabilities, but not all. The ones
that remain relevant:

- Cross-site scripting (XSS) through rendered workout, article or glossary content
- Prototype pollution or unsafe deserialisation in the backup **import** path
  (`Settings → Restore`), which parses user-supplied JSON
- Dependency vulnerabilities that reach the shipped bundle
- Service-worker or cache-poisoning issues that could persist malicious assets
- Anything that exfiltrates `localStorage` contents off-device

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

Use GitHub's [private vulnerability reporting](https://github.com/alarboulletmarin/zoned/security/advisories/new)
— it opens a private channel visible only to the maintainer. If you would rather
use email, write to **a.larboulletmarin@gmail.com** with `[security]` in the
subject.

Helpful things to include: the affected URL or file, reproduction steps, what an
attacker gains, and the browser/version you tested on. A proof of concept is
welcome but never required.

## What to expect

This is a solo, non-commercial project maintained in spare time, so response
times are best-effort rather than contractual:

- **Acknowledgement** — within 5 days
- **Assessment and plan** — within 14 days
- **Fix** — deployed as soon as it is ready; because the site is continuously
  deployed, a merged fix is live within minutes

There is no bug bounty. Credit in the release notes and the advisory is offered
for every valid report, unless you would prefer to stay anonymous.

## Out of scope

- Missing security headers with no demonstrated impact
- Reports from automated scanners without a working proof of concept
- Vulnerabilities in third-party services Zoned links to (Strava, Ko-fi, Overpass)
- Anything requiring physical access to an unlocked device, or a
  already-compromised browser or extension
- Self-XSS reachable only by pasting code into the developer console
