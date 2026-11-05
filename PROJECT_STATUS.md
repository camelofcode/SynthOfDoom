# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 5 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: Phase 4 complete
- Overall status: computer, pointer, and optional MIDI input share a verified ownership-aware route; ready to begin Phase 5 accessible reusable controls

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
- Added strict types for oscillator waveforms, filter types, noise colours, note events, MIDI messages, stable parameter IDs, and LFO targets.
- Added a central 63-entry parameter registry covering the legacy signal path, with defaults, safe ranges, steps, units, scaling curves, formatting, modulation eligibility, and MIDI-learn eligibility.
- Added a versioned `SynthPatch` schema with JSON-safe defaults, validation, version-zero migration, clamping, and safe fallback for malformed or unsupported data.
- Added pure MIDI note/frequency, octave transpose, velocity, percentage, MIDI CC, linear, logarithmic, exponential, and bipolar conversion helpers.
- Added immutable last-note-priority state transitions with duplicate note-on protection, ordered fallback, and all-notes-off behaviour.
- Added focused unit tests for registry integrity, formatting, conversion boundaries, patch round trips/migration, malformed data, and note-priority ordering.
- Added a lazy, injectable `AudioContext` lifecycle with idle, starting, running, suspended, interrupted, closed, failed, and disposed states plus retry support.
- Added the framework-independent `SynthEngine` API for start, note-on/off, all-notes-off, typed parameter changes, validated patch loading, analyser access, subscriptions, and idempotent disposal.
- Built the complete monophonic audio graph: three oscillators, deterministic white/pink/brown noise, four mixer sources with equal-power dual-filter routing, two filters, independent filter ADSRs, amp ADSR, three reroutable LFOs, and global portamento.
- Rebuilt delay from native `DelayNode`, feedback gain/filter, and `WaveShaperNode` saturation, with equal-power wet/dry mix and bypass.
- Added conservative compressor/master output protection and an analyser output for later visualisation.
- Added current-time-relative ADSR scheduling with retrigger holds, safe zero-time handling, independent release controls, and release regression coverage.
- Added a typed fake Web Audio context and deterministic tests for lifecycle, graph construction, note priority, pitch/glide, envelope scheduling, LFO rerouting, parameter/patch application, noise generation, and complete source disposal.
- Added an explicit Start audio UI with visible lifecycle and actionable failure state; verified real browser context creation through Playwright.
- Added an ownership-aware note router shared by computer keyboard, pointer keyboard, and MIDI so one source cannot release a note still held by another.
- Added a disposable computer-keyboard adapter with the documented `Q`–`I` map, Z/X octave shifts, repeat/form-field guards, and blur/visibility stuck-note prevention.
- Added a metadata-driven pointer keyboard with pointer capture, cancel/leave release handling, shared active-note highlighting, and touch-safe events.
- Added deliberate Web MIDI permission, unsupported/denied/error states, input enumeration and selection, hot-plug refresh, device-scoped note ownership, and disconnect cleanup.
- Added strict MIDI decoding for note-on, velocity-zero note-off, note-off, control-change, channel, malformed, and unsupported messages.
- Added stable-ID MIDI learn with one-to-one collision handling, CC scaling through the parameter registry, visible learn/mapping state, clearing, and versioned local-storage persistence.
- Added deterministic unit tests for multi-source ownership, keyboard cleanup, MIDI parsing/devices/CC, mapping persistence, and a Playwright smoke test for real keyboard and pointer note paths.

## Next actions

1. Begin Phase 5 with an accessible reusable `Knob` built on slider semantics and original SVG visuals.
2. Add keyboard, pointer/touch, reset-to-default, clamping, visible value/unit, focus, reduced-motion, and high-contrast behaviour.
3. Add reusable select, toggle, panel, value-readout, and connection/status components driven by the parameter registry.
4. Cover accessible names, keyboard changes, reset, disabled state, clamping, and callbacks with user-focused component tests.

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
- Full gate: `npm run verify` passed on 5 November 2026.
- Unit/component tests: 49 passed with Vitest/React Testing Library.
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
