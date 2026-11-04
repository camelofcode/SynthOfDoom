# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 4 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: Phase 0 in progress; repository rename complete
- Overall status: `SynthOfDoom` is established; legacy tagging/baseline capture remain before Phase 1

## Completed

- Audited the legacy Angular/Web Audio codebase and existing audio graph.
- Identified legacy defects and migration risks.
- Created the detailed React/Vite modernisation plan in `MODERNISATION_PLAN.md`.
- Agreed the initial architecture, tooling, scope, testing approach, licensing, and runtime model.
- Created the `modernisation` working branch from legacy baseline commit `4479d07`.
- Renamed the GitHub repository in place from `camelofcode/Angular2Audio` to `camelofcode/SynthOfDoom`, preserving its complete history and branches.
- Verified that local `origin` now uses `https://github.com/camelofcode/SynthOfDoom.git`.

## Next actions

1. Tag commit `4479d07` as the legacy Angular baseline.
2. Record the legacy feature/default checklist and any useful screenshots/audio if the old app can be run safely.
3. Start Phase 1 by scaffolding the React + TypeScript + Vite application at the repository root using product name `SynthOfDoom` and package name `synth-of-doom`.

## Current blocker or required decision

No current blocker or naming decision is outstanding.

## Agreed decisions

- Use `SynthOfDoom` as the product/repository name and `synth-of-doom` as the npm package name, while preserving the existing Git history.
- Use React, strict TypeScript, and Vite.
- Use npm with a committed `package-lock.json` and a repository-pinned active-LTS Node version.
- Use SCSS Modules with Dart Sass and native CSS custom properties for design tokens.
- Keep the Web Audio engine independent from React rendering.
- Reach monophonic feature parity first, then add polyphony before the first modern release is complete.
- Replace the old UI and its assets completely; create original SVG controls.
- Use an MIT licence.
- Do not use paid hosted CI. Provide a comprehensive local `npm run verify` command.
- Keep deployment implementation out of scope for now.
- Make `npm run build` produce a hosting-agnostic `dist` directory.
- The eventual runtime will be static files served by nginx over Certbot-managed HTTPS; no production Node server is required.

## Last verification

- Documentation whitespace check: passed.
- Modern application checks: not available yet because the Vite application has not been scaffolded.

## Working-tree handover

- Tracked planning files: `MODERNISATION_PLAN.md` and `PROJECT_STATUS.md`.
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
