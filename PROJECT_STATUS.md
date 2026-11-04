# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 4 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: Phase 1 complete
- Overall status: modern project foundation is verified; ready to begin Phase 2 domain and parameter contracts

## Completed

- Audited the legacy Angular/Web Audio codebase and existing audio graph.
- Identified legacy defects and migration risks.
- Created the detailed React/Vite modernisation plan in `MODERNISATION_PLAN.md`.
- Agreed the initial architecture, tooling, scope, testing approach, licensing, and runtime model.
- Created the `modernisation` working branch from legacy baseline commit `4479d07`.
- Renamed the GitHub repository in place from `camelofcode/Angular2Audio` to `camelofcode/SynthOfDoom`, preserving its complete history and branches.
- Verified that local `origin` now uses `https://github.com/camelofcode/SynthOfDoom.git`.
- Created and pushed annotated tag `legacy-angular` at untouched baseline commit `4479d07`.
- Documented the source-derived legacy behaviour, defaults, intentional design choices, known defects, and parity checklist in `LEGACY_BASELINE.md`.
- Explicitly decided not to install or run the obsolete dependency stack just to capture legacy media.
- Added the root React 19 + strict TypeScript + Vite application shell without modifying the tagged legacy application.
- Pinned development to Node 24 LTS and npm 11, with engine enforcement and a committed npm lockfile for cross-machine installs.
- Added the MIT licence and root project README.
- Added Dart Sass with global design tokens, SCSS Modules, and an initial responsive application shell.
- Added ESLint, accessibility/React rules, Prettier, Vitest, React Testing Library, and Playwright Chromium foundations.
- Added a complete local `npm run verify` gate covering formatting, type-checking, linting, component tests, browser smoke tests, and the production build.
- Confirmed the Vite production build emits a static, hosting-agnostic `dist` directory.

## Next actions

1. Begin Phase 2 by defining strict types for notes, MIDI messages, waveforms, filter types, noise colours, parameter IDs, and LFO targets.
2. Build the central parameter registry with stable IDs, ranges, defaults, scaling curves, units, formatting, modulation eligibility, and MIDI-learn eligibility.
3. Define the versioned `SynthPatch` schema plus validation and migration helpers.
4. Implement and unit-test pure note-frequency, parameter-scaling, MIDI-normalisation, formatting, and note-priority functions.

## Current blocker or required decision

No current blocker or naming decision is outstanding.

## Known dependency notes

- ESLint is pinned to the newest 9.x release because `eslint-plugin-jsx-a11y` has not yet declared ESLint 10 compatibility. No peer dependency is forced or ignored.
- `npm audit --omit=dev` reports zero production vulnerabilities.
- The full development audit currently reports seven moderate transitive `minimatch` advisories through `typescript-eslint`. npm offers only a forced breaking downgrade, so no unsafe automated fix was applied.
- npm may report optional Sass watcher/platform packages as extraneous at the top level; a clean `npm ci` reproduces the install and the verified Sass build succeeds.

## Agreed decisions

- Use `SynthOfDoom` as the product/repository name and `synth-of-doom` as the npm package name, while preserving the existing Git history.
- Use React, strict TypeScript, and Vite.
- Use npm with a committed `package-lock.json` and a repository-pinned active-LTS Node version.
- Use SCSS Modules with Dart Sass and native CSS custom properties for design tokens.
- Keep the Web Audio engine independent from React rendering.
- Use a monophonic engine only as a migration checkpoint. Monophony is an intentional legacy synth design, not a defect; SynthOfDoom will default to polyphonic operation before its first modern release is complete.
- Replace the old UI and its assets completely; create original SVG controls.
- Use an MIT licence.
- Do not use paid hosted CI. Provide a comprehensive local `npm run verify` command.
- Keep deployment implementation out of scope for now.
- Make `npm run build` produce a hosting-agnostic `dist` directory.
- The eventual runtime will be static files served by nginx over Certbot-managed HTTPS; no production Node server is required.

## Last verification

- Documentation whitespace check: passed.
- Legacy tag: `legacy-angular` exists locally and on `origin` at commit `4479d07`.
- Clean install: `npm ci --no-audit --no-fund` passed with Node 24/npm 11.
- Full gate: `npm run verify` passed on 4 November 2026.
- Component tests: 2 passed with Vitest/React Testing Library.
- Browser tests: 1 passed in Playwright Chromium.
- Production build: Vite emitted `dist/index.html` plus hashed CSS/JavaScript assets.
- Production dependency audit: zero vulnerabilities.

## Working-tree handover

- The root now contains the modern Vite application, toolchain configuration, lockfile, tests, and documentation; the legacy application remains under `Angular2Audio/` until its planned cleanup phase.
- Before changing machines, run `git status --short`, commit intended work, and push the active branch.
- Generated directories such as `node_modules`, `dist`, coverage, and Playwright output must remain untracked.

## Session update template

Copy and replace these fields after future work:

```text
Last updated:
Branch and commit:
Current phase:
Completed this session:
Next exact action:
Blockers or decisions needed:
Checks passed:
Checks failing or not run:
```
