# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 4 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: Phase 0 complete
- Overall status: ready to begin Phase 1 modern project scaffolding

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

## Next actions

1. Start Phase 1 by scaffolding the React + TypeScript + Vite application at the repository root using product name `SynthOfDoom` and package name `synth-of-doom`.
2. Add the MIT licence, pinned Node version, npm lockfile, SCSS support, strict TypeScript, linting, formatting, and test foundations described in Phase 1.
3. Establish the local `npm run verify` quality gate and confirm `npm run build` produces `dist`.

## Current blocker or required decision

No current blocker or naming decision is outstanding.

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
- Modern application checks: not available yet because the Vite application has not been scaffolded.

## Working-tree handover

- Tracked planning/baseline files: `MODERNISATION_PLAN.md`, `PROJECT_STATUS.md`, and `LEGACY_BASELINE.md`.
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
