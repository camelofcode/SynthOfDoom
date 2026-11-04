# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 4 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: planning complete; Phase 0 not started
- Overall status: ready to choose the new project name and begin the repository transition

## Completed

- Audited the legacy Angular/Web Audio codebase and existing audio graph.
- Identified legacy defects and migration risks.
- Created the detailed React/Vite modernisation plan in `MODERNISATION_PLAN.md`.
- Agreed the initial architecture, tooling, scope, testing approach, licensing, and runtime model.
- Created the `modernisation` working branch from legacy baseline commit `4479d07`.

## Next actions

1. Choose the new product and repository name.
2. Rename the existing hosted repository in place so its Git history is preserved.
3. Update the local Git remote after the hosted rename if necessary.
4. Tag commit `4479d07` as the legacy Angular baseline.
5. Start Phase 1 by scaffolding the React + TypeScript + Vite application at the repository root.

## Current blocker or required decision

- A new product/repository name has not yet been chosen.

No technical blocker prevents further planning or local investigation.

## Agreed decisions

- Preserve the existing Git history while giving the repository and application a framework-independent name.
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
