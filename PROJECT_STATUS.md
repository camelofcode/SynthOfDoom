# Project Status

> Update this file at the end of every work session and commit it with the related work.

## Current position

- Last updated: 5 November 2026
- Current branch: `modernisation`
- Baseline commit: `4479d07`
- Current phase: Phase 9 in progress
- Overall status: the instrument UI is now compact, operational, subgrouped by synth module, and uses DAW-style relative knob dragging; cross-browser, accessibility, and lifecycle hardening remain

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
- Confirmed pointer, computer-keyboard, and physical MIDI-keyboard input manually on representative hardware.
- Added an accessible `Knob` built on native slider semantics with original inline SVG artwork, registry-driven ranges/formatting, visible values, pointer/touch input, Arrow/Page/Home/End keys, clamping, disabled state, and reset button/double-click gestures.
- Added reusable accessible select, toggle, semantic panel, value-readout, and textual status-indicator components.
- Added explicit focus styling, reduced-motion behaviour, forced-colour support, and state text/icons so controls do not rely on colour alone.
- Connected a small control foundation to live oscillator waveform, filter cutoff, and delay parameters through the same engine command path.
- Added user-focused component and browser coverage for accessible names, bounds, value text, keyboard changes, range changes, resets, disabled state, callbacks, and live engine updates.
- Replaced the milestone cards/control showcase with the complete signal-flow instrument: oscillators/noise, four-channel mixer routing, dual filters and envelopes, three LFOs, amp ADSR, portamento, delay, and output.
- Added one observable serialisable patch action path so UI, MIDI CC, and future preset loads update both the engine and every rendered control consistently.
- Added unique accessible names for repeated controls and per-control visible MIDI-learn status/mapping actions.
- Added a compact dual-filter signal-flow explanation and a live analyser-driven master oscilloscope that pauses drawing while the page is hidden.
- Added responsive twelve-column desktop, stacked tablet, and two-control narrow-screen panel layouts while preserving the horizontally contained piano keyboard.
- Completed a visible local browser review of the top-level instrument and deep modulation panels; retained the existing local-only Vite/deployment model.
- Added desktop and narrow-viewport Playwright coverage including horizontal-overflow detection.
- Added five authored factory patches covering the initial state, dark mono bass, spacious mono lead, eight-voice chord pad, and polyphonic noise percussion while retaining registry validation and safe parameter bounds.
- Added a framework-independent preset manager with initialise, selection, save-as, rename, duplicate, delete, import, and export operations.
- Added versioned local-storage persistence for user patches and the selected preset, complementing the existing versioned MIDI-learn storage.
- Added visible saved/unsaved state plus confirmation before discarding edits or deleting a user patch.
- Applied every preset through the engine's single validated `loadPatch` action so the live graph, serialisable patch, and rendered controls update together.
- Made live preset loads replace and dispose the complete audio graph so delay memory, modulation connections, automation, and running sources from the previous patch cannot survive; held notes retrigger cleanly on the replacement graph.
- Added safe recovery for corrupt stored preset data and strict validation for imported JSON without risking a blank screen or unsafe graph state.
- Added regression coverage that verifies a rendered parameter change reaches the corresponding real browser `GainNode`, protecting against stale audio-graph wiring during development.
- Added unit and browser coverage for factory loads, dirty tracking, user preset operations, JSON round trips, storage recovery, and reload persistence.
- Made Playwright use the normal localhost Vite address so it can safely reuse a developer-run server regardless of whether localhost resolves to IPv4 or IPv6.
- Added patch schema version 2 with validated voice mode and one-to-eight voice count parameters plus lossless migration of existing version-1 factory, stored, and imported patches to the eight-voice polyphonic default.
- Split the former monolithic graph into reusable per-note `Voice` signal paths with independent oscillators, mixer routing, dual filters, filter envelopes, and amplitude envelopes.
- Kept noise buffers, three free-running LFOs, delay, saturation, compressor, master, and analyser shared; each graph now creates only three noise buffers regardless of voice count and normalises the summed voice bus conservatively.
- Added a deterministic allocator that chooses an idle voice, then the oldest released voice, then the oldest active voice, with a 5 ms fade before stealing an active/releasing voice.
- Preserved last-note priority and portamento in mono mode while polyphonic voices start directly at their requested pitch and release independently.
- Made live voice-mode/count changes rebuild cleanly and replay every held polyphonic note or only the last-priority monophonic note through the existing observable patch action.
- Counted repeated note-ons per input owner so one MIDI note-off cannot prematurely release a multiply-held note.
- Added focused allocator, migration, polyphonic envelope, stealing, held-patch-change, mode-switch, shared-modulation, repeated-note, and complete-disposal coverage.
- Extended the Chromium interaction test to prove simultaneous keyboard notes reach distinct native oscillator frequencies in a real Web Audio graph.
- Replaced native coordinate-based range dragging with pointer-captured relative knob movement: up/right increases and down/left decreases while native slider keyboard semantics remain intact.
- Reduced desktop knob, panel, piano, preset, audio, and spacing dimensions and reorganised the seven synth panels into a denser three-row signal-flow layout.
- Removed portfolio-style hero copy, implementation badges, explanatory signal-flow copy, and milestone footer so the standalone page presents only functional synth content and status.
- Combined each oscillator/noise source with its enable, level, and dual-filter routing controls in four visible and accessible channel strips; filters, LFOs, voice/glide, amplitude, and delay retain their own labelled subgroups.
- Separated every toggle and selector into a full-width subgroup row ahead of its numeric controls, with evenly stretched knob cards on each row to prevent mixed-size controls from overlapping.
- Replaced automatic mixed-control placement with explicit semantic rows, keeping filter ADSR controls together and centring sparse and dense knob groups consistently.
- Consolidated the title, preset selector/actions, persistent accent-colour picker, and prominent browser-required audio activation into one compact command header.
- Removed the redundant global MIDI-learn target selector while retaining per-control learn actions, mapping status, and clear-mappings control.
- Expanded the pointer instrument to a two-octave C4–C6 keyboard with fifteen white keys and ten overlaid black keys, contained horizontal scrolling, active state, and unchanged shared note routing.
- Made the interface accent themeable through the existing CSS custom-property system, with green as the default and the selected colour persisted locally.
- Applied the selected accent to the canvas-rendered master oscilloscope as well as the CSS-rendered interface, updating the waveform immediately when the picker changes.
- Allowed the mapped computer-note keys to pass through while a knob's range input retains focus, preserving slider arrow-key access without requiring a click elsewhere before playing.

## Next actions

1. Add browser failure-state and permission-denial coverage, then complete the remaining keyboard-only and accessibility smoke checks.
2. Run the general UI suite in Firefox and WebKit as well as Chromium.
3. Review tablet, mobile, 200% zoom, reduced-motion, and forced-colour behaviour against the compact six-panel interface.
4. Test long-session lifecycle behaviour, rapid preset changes, suspend/resume, backgrounding, MIDI hot-plug, and window-blur cleanup before Phase 10.

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
- Unit/component tests: 72 passed with Vitest/React Testing Library.
- Browser tests: 3 passed in Playwright Chromium (native polyphonic audio interaction, narrow responsive layout, and preset reload persistence).
- Manual physical MIDI keyboard check: passed on 5 November 2026.
- Manual sustained chord, rapid-stealing, mono glide, and representative-hardware polyphony check: passed on 5 November 2026.
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
