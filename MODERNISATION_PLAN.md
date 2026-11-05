# SynthOfDoom Modernisation Plan

> Status: active; Phase 8 complete, Phase 9 next
>
> Audit date: 4 November 2026
>
> Source baseline: `master` at `4479d07`

## 1. Goal

Turn the original Angular 2-era synthesiser into a polished portfolio project that demonstrates modern React and TypeScript practices without losing the interesting part of the project: a modular Web Audio synth with keyboard, MIDI, modulation, filters, envelopes, mixing, and effects.

The modern project is named **SynthOfDoom** because `Angular2Audio` describes an obsolete implementation detail. The existing repository has been renamed in place rather than replaced, so the original learning project and its evolution remain visible in Git. Use `SynthOfDoom` for the product/display name and `synth-of-doom` where a lowercase npm-compatible package identifier is required.

The recommended result is a client-only React application built with TypeScript and Vite. The audio engine should be framework-independent, while React owns presentation and user interaction. This separation is the most important architectural change in the plan.

## 2. Executive recommendation

Use the following baseline:

- React with TypeScript.
- Vite for the development server and production build.
- npm with a committed `package-lock.json` and a pinned active-LTS Node version.
- SCSS Modules compiled with Dart Sass, plus global CSS custom properties for design tokens. Avoid a large component library because the synth's custom controls are a central portfolio feature.
- Vitest for unit and integration tests.
- React Testing Library for accessible component tests.
- Playwright for a small set of browser-level smoke tests.
- ESLint and Prettier, run through a single local verification command.
- A hosting-agnostic `npm run build` that writes production assets to `dist`.
- An MIT licence from the start of the modern project.

Vite is a better fit than a full-stack React framework here. The application has no data fetching, server rendering, authentication, or backend routes. It needs a fast client-side development loop, static assets, worklet bundling, and a static production build. React's official documentation lists Vite as an appropriate build tool for a from-scratch client application, and Create React App is deprecated.

Sass remains a maintained and reasonable choice. Vite supports SCSS and SCSS Modules without a Vite-specific plugin when Dart Sass is installed. Use Sass for file composition, mixins, calculations, and repeated component patterns, while keeping themeable values as native CSS custom properties. The custom hardware-style controls and responsive panel layout provide enough styling work to justify it, but ordinary CSS should remain ordinary CSS rather than using Sass features gratuitously.

Hosted CI and deployment are intentionally out of scope. The project should provide an excellent local quality gate and a deterministic `dist` build. It can be integrated into the eventual portfolio site's deployment process later, when the portfolio and its subdomain strategy exist.

Do not port the Angular components one-for-one. First extract their behaviour into a typed audio/domain layer, then rebuild the controls as React components. A direct template conversion would preserve the strongest source of technical debt: UI lifecycle methods constructing and mutating the audio graph.

### 2.1 Runtime and eventual hosting model

The application should remain fully static at runtime:

```text
Development/build machine                    Production server

Node + npm                                   nginx + Certbot
    │ npm ci / verify / build                    │ serves files over HTTPS
    v                                             v
dist/ (HTML, JS, CSS, SVG, worklet assets) ---> portfolio subdomain
```

- Node is a build-time tool, not a production runtime requirement.
- The generated `dist` directory can be copied to an nginx document root and served directly.
- The build may run on a development machine before uploading `dist`, or on the server with Node installed temporarily/for build tasks. In either case, no Node process needs to remain running.
- Certbot-managed HTTPS is suitable and is required for Web MIDI and AudioWorklet outside trusted local development origins.
- `vite preview` is only for checking `dist` locally; it is not the production server.
- If client-side routes are added later, nginx should fall back unknown application paths to `index.html` (for example with `try_files`). The initial single-screen synth does not require routing.
- Hashed Vite assets can receive long-lived immutable caching; `index.html` should use conservative caching so new builds are discovered promptly. This is future nginx configuration, not part of the current implementation scope.
- A Node server should only be introduced if later requirements add genuine server responsibilities such as accounts, cloud preset storage, private APIs, or server-side rendering.

## 3. Current codebase assessment

### 3.1 Repository and toolchain

The authored application is small—30 TypeScript files and roughly 1,700 lines across the application, styles, views, and build files—but the repository tracks 1,576 files. About 1,460 of those are vendored Angular/RxJS library files and another 62 are generated application JavaScript or source-map files.

The current stack is:

- Angular 4-era component APIs with TypeScript 2.5 targeting ES5.
- Express 4 and Pug used only to serve a single static application page.
- SystemJS for runtime module loading.
- Gulp 3 for copying dependencies into `public`.
- Angular, RxJS, core-js, and zone.js copied into source control.
- Visual Studio Node project and solution artefacts.
- No meaningful README or automated tests.
- `package-lock.json` is explicitly ignored, so installs are not reproducible.

There is no application backend. Express only renders the initial page and serves static files, so it can be removed rather than replaced.

### 3.2 Existing audio graph

The present synth is monophonic with last-note priority:

```text
Oscillator 1 --\
Oscillator 2 ---\
Oscillator 3 ----> per-channel gain and filter crossfade ---> Filter 1 --\
Noise -----------/                                    \----> Filter 2 ----> Amp ADSR ---> Delay ---> Output

LFO 1/2/3 ---> selected oscillator detune or filter cutoff AudioParam

Computer keyboard -----\
Web MIDI note input ----> note/velocity events
Web MIDI CC input ------> MIDI-learned parameter updates
```

Current modules and behaviour worth preserving are:

- Three oscillators with waveform, octave, detune, and portamento-style pitch glide.
- White, pink, and brown noise.
- Four-channel mixer with level, on/off, and a crossfade between two filters.
- Two biquad filters with selectable types and filter envelopes.
- Amp ADSR envelope with velocity sensitivity.
- Three LFOs with waveform, rate, depth, and assignable targets.
- Delay with time, feedback, feedback filtering, saturation, wet/dry mix, and bypass.
- Computer-keyboard note input.
- Web MIDI notes and MIDI CC learn.
- An on-screen keyboard concept.

### 3.3 Problems to address during the port

These are migration requirements, not reasons to reproduce the old implementation exactly:

| Area             | Current issue                                                                                                             | Required outcome                                                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Audio startup    | `AudioContext` is created eagerly and only resumed on a keyboard event.                                                   | Create/resume it after an explicit pointer or keyboard gesture, show its state, and support retry.                              |
| Scheduling       | Many `AudioParam` calls use absolute time `0`; envelope scheduling cancels from `0`.                                      | Schedule relative to `audioContext.currentTime` and prevent discontinuities/clicks when retriggering.                           |
| Amp envelope     | The release knob callback writes to `sustain`.                                                                            | Release updates the release value and has a regression test.                                                                    |
| Filter envelope  | The release knob callback also writes to `sustain`.                                                                       | Release updates the release value and has a regression test.                                                                    |
| Filter controls  | The shelf-filter branch reinitialises the Q knob as gain instead of the gain knob.                                        | Filter-type-specific controls and ranges are explicit and tested.                                                               |
| Delay saturation | It uses deprecated, main-thread `ScriptProcessorNode` and assumes stereo buffers.                                         | Prefer a native `WaveShaperNode`; use `AudioWorklet` only if custom DSP remains necessary.                                      |
| Lifecycle        | `AfterViewChecked` repeatedly initialises knobs, registers targets, and forces change detection.                          | Initialise the graph and parameter registry exactly once; clean up listeners and nodes on disposal.                             |
| Piano            | Keys are visual only; a delayed jQuery script adds highlighting but does not play notes.                                  | Render keys from note data and wire pointer, touch, keyboard, and MIDI state to the same note API.                              |
| MIDI             | MIDI init is called manually as if it were a component lifecycle method; there is no hot-plug handling or visible status. | Request access deliberately, listen for device state changes, select inputs, and expose unsupported/denied/disconnected states. |
| MIDI learn       | Mappings are in memory, targets can be registered repeatedly, and identifiers are label-derived.                          | Use stable parameter IDs, enforce one registry entry per ID, allow clearing mappings, and persist them locally.                 |
| Keyboard input   | Global listeners are never removed and key repeats depend on downstream de-duplication.                                   | Ignore repeats, avoid capturing typing in form fields, handle blur/visibility loss, and dispose listeners.                      |
| Typing           | `any`, `Function`, boxed `String`, global interfaces, and index access hide errors.                                       | Use strict TypeScript, discriminated event types, `string`, explicit function signatures, and module exports.                   |
| UI/layout        | Fixed absolute positions at an 800 px width make the synth non-responsive.                                                | Use semantic panels and CSS Grid/Flexbox with desktop, tablet, and narrow-screen layouts.                                       |
| Accessibility    | Custom knobs have no focus, keyboard operation, name, value text, or ARIA semantics.                                      | Provide native or correctly implemented slider semantics, full keyboard control, focus styling, and screen-reader labels.       |
| Repository       | Generated output, dependencies, binaries, and IDE build files are committed.                                              | Track authored source and lockfile only; generate build/test artefacts locally as needed.                                       |

## 4. Scope and sequencing

### 4.1 First release scope

The first modern release should reach feature parity with the useful parts of the current synth, plus polyphony, a polished responsive UI, tests, presets, and a production `dist` build.

Keep the engine monophonic as an internal parity checkpoint, then add polyphony as a distinct late phase before the first modern release is considered complete. This is an engineering sequence, not a judgement on the original design or the final product goal: monophony was an intentional and conventional synthesiser architecture, while SynthOfDoom will default to polyphonic operation. Polyphony changes oscillator lifetime, voice allocation, envelopes, CPU use, and MIDI semantics; separating it from the initial port keeps those changes understandable and testable without pushing an important portfolio feature into an indefinite backlog.

### 4.2 Explicit non-goals for the first release

- Server-side rendering or a Node production server.
- User accounts or cloud preset storage.
- A general-purpose visual patching system.
- Plugin formats such as VST/AU.
- Sequencing, recording, or offline audio export.
- Pixel-perfect reproduction of the old UI.
- Supporting obsolete browsers.

### 4.3 Suggested delivery slices

Each slice should end in a runnable application on `main`; avoid a long-lived rewrite branch that only works at the end.

1. Modern shell and quality gates.
2. Headless synth engine with one oscillator and amp envelope.
3. Complete audio graph and note input.
4. Reusable accessible controls and full panel UI.
5. MIDI, MIDI learn, presets, and persistence.
6. Polyphonic voice architecture and voice stealing.
7. Visual polish, browser hardening, documentation, and the production `dist` build.

### 4.4 Cross-machine progress and handover workflow

Use Git and a committed [`PROJECT_STATUS.md`](PROJECT_STATUS.md) as the shared source of truth. Do not rely on editor task lists, uncommitted local notes, globally installed packages, or one machine's `node_modules`.

At the start of a work session:

1. Pull the latest branch and read `PROJECT_STATUS.md` followed by the relevant phase in this plan.
2. Use the repository-pinned Node version and run `npm ci` rather than carrying `node_modules` between machines.
3. Confirm the branch/commit and the stated next action still match the repository.

At the end of a work session:

1. Update `PROJECT_STATUS.md` with the phase, completed work, exact next action, blockers/decisions, and the last commands that passed or failed.
2. Keep changes in small, descriptive commits. Update status in the same commit as the work where practical.
3. Run the proportionate checks; use the complete `npm run verify` gate at phase/release checkpoints.
4. Commit and push source, tests, documentation, `package-lock.json`, and the status update before switching machines.
5. Do not commit `node_modules`, coverage/Playwright output, or `dist`; all must be reproducible from the tracked source.

`PROJECT_STATUS.md` is intentionally a concise mutable handover, while this document remains the stable long-form plan and decision record.

## 5. Target architecture

### 5.1 Core rule

React must not own raw `AudioNode` objects in component state, and React render cycles must not construct or reconnect the graph. The synth engine is an imperative, disposable object. React sends it typed commands and subscribes to a small serialisable state snapshot.

```text
React UI
  ├─ panels and controls
  ├─ patch state / preset actions
  └─ status state (audio, MIDI, active notes)
           │ typed parameter/note commands
           v
Synth controller / store
  ├─ parameter registry
  ├─ input router
  ├─ patch serialisation
  └─ event subscriptions
           │
           v
Framework-independent Web Audio engine
  ├─ graph construction and disposal
  ├─ oscillators, noise, mixer, filters
  ├─ envelopes and note priority
  ├─ LFO routing
  └─ delay / master output / analyser
```

### 5.2 Proposed source layout

```text
src/
  app/
    App.tsx
    AppProviders.tsx
  audio/
    SynthEngine.ts
    createAudioContext.ts
    voices/
      Voice.ts
      VoiceAllocator.ts
    graph/
      createOscillatorBank.ts
      createNoiseSource.ts
      createMixer.ts
      createFilterBank.ts
      createEnvelope.ts
      createDelay.ts
      createMasterOutput.ts
    modulation/
      LfoRouter.ts
    scheduling/
      adsr.ts
      audioParam.ts
    worklets/                 # only if native nodes cannot implement an effect
  synth/
    patch.ts
    parameters.ts
    parameterRegistry.ts
    notePriority.ts
    defaults.ts
    actions.ts
  input/
    computerKeyboard.ts
    midi.ts
    midiLearn.ts
    pointerNotes.ts
  components/
    controls/
      Knob.tsx
      Toggle.tsx
      Select.tsx
    panels/
      OscillatorPanel.tsx
      MixerPanel.tsx
      EnvelopePanel.tsx
      FilterPanel.tsx
      LfoPanel.tsx
      DelayPanel.tsx
    keyboard/
      PianoKeyboard.tsx
    status/
      AudioStartOverlay.tsx
      MidiStatus.tsx
    visualisers/
      Oscilloscope.tsx
  hooks/
    useSynth.ts
    useComputerKeyboard.ts
    useMidi.ts
  styles/
    _tokens.scss
    _mixins.scss
    global.scss
  test/
    fakeAudioContext.ts
  main.tsx
tests/
  e2e/
public/
```

Exact filenames can evolve, but keep the boundaries between `audio`, `synth`, `input`, and `components`.

### 5.3 Parameter model

Create one typed registry that is the source of truth for every controllable value. A parameter definition should include:

- Stable ID, such as `oscillator.1.detune` or `filter.2.cutoff`.
- Display name, group, unit, minimum, maximum, default, and step.
- Scaling curve: linear, logarithmic, exponential, bipolar, or enumerated.
- Formatter for visible value text.
- Whether it is a valid modulation target and its modulation range.
- Whether it is MIDI-learnable.

This registry should drive control rendering, validation, preset serialisation, MIDI scaling, and modulation menus. It replaces the current duplicated ranges and label-derived IDs spread across Angular components.

Use perceptual scaling where appropriate. Frequency controls should normally be logarithmic; time controls benefit from a non-linear curve; gain, percentages, bipolar detune, and discrete enums need their own mappings. MIDI CC values remain 0–127 at the input boundary and are normalised once.

### 5.4 State ownership

Use a small application store built with React context plus `useReducer` or `useSyncExternalStore` before adding a state library. The state shape is modest and the portfolio value comes from clear boundaries, not dependency count.

Separate:

- **Patch state:** serialisable parameter values, effect bypass, LFO assignments, and mixer routing.
- **Session state:** audio context status, MIDI permission/devices, active notes, learn mode, errors, and selected preset.
- **Engine state:** `AudioNode`, `AudioParam`, connections, timers, and subscriptions; never serialised and never placed in React state.

Control changes should update both the serialisable patch state and the engine through one action path regardless of whether the source is pointer input, keyboard, MIDI CC, or preset loading.

## 6. Step-by-step implementation plan

### Phase 0 — Preserve and characterise the legacy behaviour

1. Use the chosen product/repository name `SynthOfDoom`, with `synth-of-doom` as the npm package identifier.
2. Rename the existing repository or remote in place so all current commits remain in the same Git history. This has been completed at `camelofcode/SynthOfDoom`; do not initialise a new repository or squash-import the old one.
3. Update the remote URL locally if the hosting provider does not do so automatically; update the README title, `package.json` name, page metadata, and later screenshots to use the new identity.
4. Create a migration branch and tag the existing commit, for example `legacy-angular`, before replacing the old application on `main`.
5. Do not revive the old application solely to capture screenshots or audio. This personal project has no compatibility stakeholders, and installing the obsolete dependency tree provides little value.
6. Record the source-derived feature/default inventory in [`LEGACY_BASELINE.md`](LEGACY_BASELINE.md).
7. Document the current keyboard mapping (`Q, 2, W, 3, E, R, 5, T, 6, Y, 7, U, I`) and current defaults/ranges.
8. Distinguish intentional legacy design choices from implementation defects. Monophony, last-note priority, three oscillators, dual parallel filters, and three freely assignable LFOs are design choices; the release/filter/piano/lifecycle problems in Section 3.3 are defects.
9. Treat the source and Git tag as the legacy reference. Do not install or run the obsolete dependency tree merely to complete Phase 0.

**Exit criteria:** the renamed repository retains its full history, the old code has a durable tag, the parity checklist exists, and intentional behaviour is distinguishable from known defects.

### Phase 1 — Establish the modern project shell

1. Scaffold React + TypeScript with Vite at the repository root rather than adding another nested project.
2. Pin an active-LTS Node release that satisfies the selected Vite/Vitest engine requirements in `.nvmrc` or `.node-version`, and declare it in `package.json`.
3. Use npm and commit `package-lock.json`; remove the lockfile ignore rule.
4. Add an MIT `LICENSE` file and the corresponding `license` metadata to `package.json`.
5. Install the maintained Dart Sass implementation (`sass-embedded` or `sass`) and use `.module.scss` for component-scoped styles plus a small global SCSS entry point.
6. Add scripts with stable names:
   - `dev`
   - `build` (`tsc --noEmit` followed by `vite build`)
   - `preview`
   - `typecheck`
   - `lint`
   - `format` and `format:check`
   - `test` and `test:run`
   - `test:e2e`
   - `verify` (format check, typecheck, lint, unit/component tests, browser smoke tests once added, and production build)
7. Enable strict TypeScript, including unused-code and safe indexed-access checks where practical.
8. Configure ESLint for TypeScript, React, hooks, and accessibility; configure Prettier without duplicating formatting rules in ESLint.
9. Add Vitest with a browser-like DOM environment and React Testing Library.
10. Document `npm run verify` as the required local quality gate before merging. Do not add GitHub Actions or another paid hosted CI service.
11. Confirm that `npm run build` creates a self-contained `dist` directory without assuming a particular hosting provider or portfolio implementation.
12. Add a temporary application shell with a visible “Start audio” action and environment/browser support panel.

**Exit criteria:** a clean clone can run `npm ci`, `npm run dev`, and `npm run verify`; `npm run build` produces `dist`; the project is named consistently and licensed under MIT.

### Phase 2 — Define the domain and parameter contracts

1. Model oscillator waveforms, filter types, noise colours, note events, MIDI messages, parameter IDs, and LFO targets as strict TypeScript types.
2. Create the complete parameter registry described in Section 5.3.
3. Define a versioned `SynthPatch` JSON shape containing only serialisable data.
4. Add defaults and validation/migration helpers so a malformed or older local preset cannot break the engine.
5. Implement pure conversion functions:
   - MIDI note number to frequency.
   - Normalised/percentage/MIDI CC conversion.
   - Linear, logarithmic, exponential, and bipolar parameter mapping.
   - Value formatting.
   - Last-note-priority stack behaviour.
6. Unit test boundary values, malformed values, duplicate note-on events, note-off ordering, and patch migration.

**Exit criteria:** all control ranges and defaults live in one typed registry and the pure domain layer has high-value unit tests.

### Phase 3 — Build a framework-independent audio engine

1. Create `AudioContext` lazily after an explicit user gesture; support `suspended`, `running`, `interrupted`, `closed`, and failure states in the UI.
2. Implement `SynthEngine` with explicit `start`, `noteOn`, `noteOff`, `setParameter`, `loadPatch`, and `dispose` methods.
3. Recreate the graph one module at a time, starting with one oscillator into a master gain so every step is audible and testable.
4. Add all three oscillators, octave transposition, detune, and global portamento.
5. Add looping white/pink/brown noise buffers. Generate buffers from an injectable random source so statistical/offline tests can be deterministic.
6. Add four mixer inputs, levels, enable switches, and equal-power rather than simple linear crossfade between Filter 1 and Filter 2 if listening tests confirm it is preferable.
7. Add the two filters and their type-specific Q/gain behaviour.
8. Implement a reusable ADSR scheduler for both amp and filter envelopes:
   - use `currentTime`;
   - retain the current value on retrigger where supported;
   - avoid zero-time discontinuities;
   - clamp time constants and targets to safe ranges;
   - test the release-control regression.
9. Add LFO nodes and an explicit modulation router. Disconnect previous `AudioParam` targets safely, prevent duplicate connections, and reset offsets/ranges predictably.
10. Rebuild delay with native nodes. Use `DelayNode`, feedback gain, `BiquadFilterNode`, and `WaveShaperNode` for saturation. Only introduce an `AudioWorklet` if a native-node waveshaper cannot produce the intended result.
11. Add a conservative master gain/limiter strategy to reduce clipping and protect users from unexpectedly loud output.
12. Add `AnalyserNode` output for a later oscilloscope without coupling it to React renders.
13. Make every graph factory return a cleanup function or disposable object. Ensure hot reload and React Strict Mode cannot leave duplicate oscillators or connections playing.

**Exit criteria:** the complete graph can be controlled through TypeScript APIs without rendering React, produces no sound before opt-in, stops cleanly, and passes offline/fake-context tests for routing and scheduling.

### Phase 4 — Unify note and control input

1. Route all note sources to the same typed `noteOn`/`noteOff` API.
2. Rebuild the computer keyboard adapter:
   - ignore `event.repeat`;
   - ignore shortcuts while a form field is active;
   - call `preventDefault` only for mapped keys while the synth is active;
   - release held notes on window blur or hidden visibility;
   - support octave shift controls;
   - remove all listeners on disposal.
3. Build the on-screen keyboard from note metadata rather than hard-coded markup. Use pointer events and pointer capture so mouse, pen, and touch share one path. Handle pointer cancel and pointer leaving the keyboard.
4. Request Web MIDI access through a clear user action. Do not treat MIDI availability as guaranteed.
5. Enumerate MIDI inputs, expose device names/status, allow “all inputs” or one selected input, and react to connect/disconnect events.
6. Correctly parse note-on, velocity-zero note-off, note-off, control-change, channel, and malformed/short messages.
7. Implement MIDI learn against stable parameter IDs:
   - enter/cancel learn mode;
   - bind the next CC;
   - indicate the learned CC beside the control;
   - clear one or all bindings;
   - choose an explicit collision policy;
   - persist bindings in versioned local storage.
8. Keep MIDI optional. The app must remain fully usable by pointer and computer keyboard when Web MIDI is unsupported or permission is denied.

**Exit criteria:** computer keys, pointer keys, and MIDI notes produce the same note state; stuck notes are prevented; MIDI device and learn states are visible and recoverable.

### Phase 5 — Build accessible reusable React controls

1. Implement a `Knob` using an accessible slider foundation. Prefer a visually styled native range input where feasible; otherwise implement `role="slider"`, name, bounds, current value, value text, and full keyboard semantics.
2. Create an original SVG knob face/indicator for the new visual design. It may be inline SVG driven by CSS transforms so it stays crisp at any scale. Do not carry over the old `skin1_back.svg`, `skin1_front.svg`, jQuery highlighting, layout, or other UI assets.
3. Support pointer drag, touch, Arrow keys, Page Up/Down, Home/End, and a reset-to-default gesture. Do not rely on document-wide mouse listeners that leak after unmount.
4. Keep a visible numeric value and unit. Let users double-click or use a small popover to type an exact value if this can be added without harming touch use.
5. Add reusable `Select`, `Toggle`, `Panel`, `ValueReadout`, and connection/status indicator components.
6. Test controls from the user's perspective with React Testing Library: accessible name, keyboard changes, clamping, reset, disabled state, and callback value.
7. Use CSS custom properties for runtime colour, spacing, typography, radii, shadows, panel materials, focus rings, and control-state colours. Use SCSS Modules for component scoping, shared mixins, responsive rules, and build-time composition.
8. Use the Sass module system (`@use`/`@forward`) rather than legacy Sass `@import`, and keep nesting shallow enough that the compiled CSS remains easy to inspect.
9. Respect reduced-motion and high-contrast preferences. Never communicate on/off, routing, or MIDI-learn state with colour alone.

**Exit criteria:** controls are reusable across every synth panel and pass keyboard-only and automated accessibility checks.

### Phase 6 — Assemble and polish the synth interface

1. Establish a visual direction: modern dark hardware, restrained analogue cues, strong typography, and colour-coded signal sections rather than a literal vintage-instrument copy.
2. Use a responsive CSS Grid:
   - wide desktop: signal-flow-oriented multi-column panel;
   - tablet: two-column grouped panels;
   - narrow/mobile: single-column panels with a sticky transport/status bar;
   - keyboard scrolls horizontally only when necessary.
3. Group modules by signal flow: sources, mixer/routing, filters, modulation, amp, effects/output.
4. Add clear enabled/bypassed/active states and concise help text or tooltips for specialist controls.
5. Add a compact signal-flow diagram or routing indicator so the unusual dual-filter mixer is understandable.
6. Add audio/MIDI status in the header and show actionable errors instead of console-only messages.
7. Add a lightweight oscilloscope or spectrum view driven by `AnalyserNode` and `requestAnimationFrame`. Pause drawing when hidden and keep analyser samples out of React state.
8. Animate only low-cost visual properties and never let animation or pointer movement cause audio graph reconstruction.
9. Test the layout at representative desktop, tablet, and mobile widths and at 200% zoom.

**Exit criteria:** the complete feature set is operable at supported widths, navigation order is logical, and the design is strong enough for portfolio screenshots/video.

### Phase 7 — Presets and persistence

1. Add several authored factory patches that showcase different areas of the engine.
2. Support initialise/reset, select preset, save-as, rename, duplicate, delete, import JSON, and export JSON.
3. Store user patches and MIDI mappings in versioned local storage with validation and safe fallbacks.
4. Make unsaved changes visible and require confirmation before destructive preset actions.
5. Apply a loaded patch through one batched action path to avoid audible intermediate states and excessive renders.
6. Consider encoding a patch in the URL as a later enhancement; do not make it a requirement for the first release.

**Exit criteria:** a user can return to the app and recover patches/mappings, and bad stored data fails safely without a blank screen or dangerous output.

### Phase 8 — Add polyphonic voice architecture

1. Preserve the monophonic engine as a working checkpoint, then introduce a `Voice` abstraction. Each voice owns the nodes whose state must evolve independently for one note: oscillator bank, source gains, filters, filter envelopes, and amp envelope.
2. Keep truly shared nodes outside voices: delay/effects, analyser, master gain/protection, and the final destination. Treat LFOs as global/free-running for the first polyphonic implementation so modulation remains predictable and CPU use stays reasonable.
3. Decide how noise is shared without creating a new random buffer source for every note. A shared looping noise source can feed per-voice noise gains before each voice's filters and envelope.
4. Add a `VoiceAllocator` with a configurable maximum voice count. Start with a conservative default such as eight voices and allow a monophonic setting for patches that rely on note priority and portamento.
5. Define deterministic allocation and stealing rules: reuse an idle voice first, then the oldest released voice, then the oldest active voice. Stop/cancel the stolen voice safely before reassigning it.
6. Track repeated presses of the same note correctly rather than using a simple set. A note should not be released while another input source or repeated note-on still owns it.
7. Apply patch changes to all active and idle voices through the same parameter registry. New voices must initialise from the complete current patch, not a stale default.
8. Define polyphonic portamento semantics explicitly. Recommended default: glide only in monophonic/legato mode; independently allocated polyphonic voices start at their requested pitch.
9. Include voice-count/mono mode in the versioned patch schema and update factory presets to demonstrate chords as well as classic mono leads and basses.
10. Add tests for allocation, reuse, stealing order, repeated notes, rapid note bursts, all-notes-off, patch changes while notes are held, and disposal of every node owned by a voice.
11. Profile sustained chords and rapid playing on representative desktop and mobile hardware. Reduce the default voice count or expensive per-voice processing if audio drop-outs occur.

**Exit criteria:** chords play with independent amp and filter envelopes; voice stealing is deterministic and click-resistant; monophonic patches still behave intentionally; repeated play does not leak nodes or increase CPU after voices return idle.

### Phase 9 — Verification and browser hardening

1. Unit-test pure music, mapping, parameter, patch, note-priority, and MIDI parsing logic with Vitest.
2. Test engine routing and scheduling against a typed fake `AudioContext`; use `OfflineAudioContext` for a small number of real rendering assertions where browser support allows.
3. Test React controls and panels with React Testing Library.
4. Add Playwright smoke tests for:
   - audio start UI and unsupported/failure state;
   - computer keyboard note activation;
   - pointer keyboard note activation/release;
   - parameter adjustment and visible value;
   - preset persistence across reload;
   - responsive layout at desktop and mobile sizes.
5. Keep physical MIDI verification as a documented manual test because automated browser tests generally have no MIDI hardware. Unit-test MIDI event parsing and mock access/device state changes.
6. Run the general UI suite in Chromium, Firefox, and WebKit. Treat MIDI as a progressive enhancement and manually verify it in browsers that implement Web MIDI.
7. Add an automated accessibility scan, then perform keyboard-only and screen-reader spot checks manually.
8. Profile long sessions for leaked audio nodes, event listeners, animation frames, and increasing CPU usage.
9. Test audio suspend/resume, tab backgrounding, device connect/disconnect, permission rejection, window blur while a note is held, and rapid preset changes.
10. Run the complete local `npm run verify` gate before each release checkpoint and record the manual audio/MIDI checklist result in the release notes or pull request description.

**Exit criteria:** the local automated suite covers deterministic behaviour; a short manual matrix covers audio and physical MIDI; there are no known stuck-note, duplicate-node, clipping, voice-allocation, or lifecycle leaks.

### Phase 10 — Repository cleanup and documentation

1. Once parity is demonstrated, move the old source to a clearly named legacy branch/tag rather than retaining two applications indefinitely on `main`.
2. Remove generated/vendored JavaScript, Angular packages, SystemJS, Gulp, Express/Pug, jQuery, Visual Studio solution/project artefacts, `bin`, and `obj` from the modern branch.
3. Replace the current generic `.gitignore` with one appropriate for Node, Vite, Vitest, Playwright, editors, and the operating systems used by contributors. Do not ignore npm's lockfile.
4. Write a portfolio-quality README containing:
   - a short value proposition and screenshot/GIF;
   - features and controls;
   - keyboard map and MIDI instructions;
   - architecture and signal-flow diagram;
   - local setup and scripts;
   - test strategy;
   - browser/support limitations;
   - project history and what the modernisation demonstrates.
5. Keep the MIT licence visible in the README and package metadata. Add comments and source links for any DSP algorithms that require attribution; all new UI artwork, including knobs, should be original to this rewrite.
6. Add favicons, social preview metadata, and a useful page title/description. Defer the canonical URL until the portfolio subdomain exists.
7. Verify that `npm run build` always replaces/populates `dist` predictably and that `npm run preview` can serve that exact output locally.
8. Document the future hosting constraint without implementing it: the eventual portfolio subdomain must use HTTPS for Web MIDI, but deployment configuration belongs to the portfolio project and is out of scope here.
9. Capture a short demo video showing sound design, polyphonic playing, computer keyboard input, physical MIDI input, and MIDI learn. It can be added to the repository/portfolio later without blocking the code milestone.

**Exit criteria:** `main` contains only the renamed modern authored project, `npm run verify` passes locally, `npm run build` produces a reviewable `dist` directory, and a reviewer can understand and run the project in minutes.

## 7. Testing strategy in more detail

### 7.1 Highest-value unit tests

- MIDI note-to-frequency reference values and octave clamping.
- Last-note priority for overlapping notes and out-of-order releases.
- Duplicate note-on protection and all-notes-off behaviour.
- ADSR event schedules for first note, retrigger, release, and zero-time stages.
- The two release controls update `release`, not `sustain`.
- Filter envelope targets for positive and negative depth.
- All parameter scaling curves at minimum, midpoint, maximum, and invalid input.
- MIDI decoding, including note-on velocity zero.
- MIDI learn collision and clear behaviour.
- Patch validation, migration, round-trip serialisation, and unsafe stored data.
- LFO connect/disconnect idempotence.
- Graph disposal and repeated creation.
- Polyphonic voice allocation, reuse, stealing, repeated-note ownership, all-notes-off, and disposal.

### 7.2 What not to over-test

Do not test React implementation details, CSS class names, exact canvas pixels, or browser Web Audio internals. Test user-visible control behaviour and the engine commands/connections the application owns.

### 7.3 Manual release checklist

- Audio is silent until the user starts it.
- First played note is not clipped or lost.
- All input methods can start and release notes.
- Switching tabs or blurring the window cannot leave a stuck note.
- Every knob works by pointer and keyboard and announces a useful value.
- Each oscillator, noise colour, filter type, envelope, LFO target, mixer route, and delay control is audible.
- Delay cannot enter uncontrolled feedback at maximum settings.
- MIDI permission rejection has a recovery path.
- MIDI hot-plug works without reload in supported browsers.
- The page remains usable without MIDI.
- Chords have independent amp/filter envelopes, and exceeding the voice limit steals voices predictably.
- Monophonic mode still provides last-note priority and intentional portamento.
- Refresh restores the selected user patch and MIDI mappings.
- Desktop, tablet, mobile, zoomed, reduced-motion, and high-contrast layouts remain operable.

## 8. Portfolio-focused enhancements after the first release

Prioritise enhancements that demonstrate engineering depth without obscuring the initial migration:

1. A step sequencer or arpeggiator synced to a shared transport.
2. Patch sharing through compact URL state.
3. Audio recording/export using `MediaRecorder` or offline rendering.
4. Additional effects implemented as AudioWorklets, with performance comparisons.
5. A modulation matrix that allows several sources and targets.
6. Per-voice or retriggerable LFO modes in addition to the first release's global/free-running LFOs.
7. PWA/offline support after install/update and audio-cache behaviour are tested carefully.

The step sequencer/arpeggiator is the strongest technical follow-up because it builds on the completed polyphonic engine and adds timing/transport concerns without requiring a backend.

## 9. Risks and mitigations

| Risk                                                                                        | Mitigation                                                                                                                                        |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework rewrite and DSP changes happen simultaneously, making regressions hard to locate. | Build vertical slices, keep a parity checklist, and test the audio/domain layer without React.                                                    |
| Browser autoplay policies make the app appear broken.                                       | Use a prominent start overlay, lazy context creation, state feedback, and retry.                                                                  |
| Web MIDI is unavailable in some browsers or contexts.                                       | Treat it as progressive enhancement, preserve keyboard/pointer operation, and document that the eventual host must use HTTPS.                     |
| React Strict Mode or hot reload duplicates audio nodes.                                     | Keep engine construction outside renders, make start/dispose idempotent, and test remounts.                                                       |
| Custom knobs become inaccessible.                                                           | Start from slider semantics and keyboard interaction, then add visual styling.                                                                    |
| Feedback/detune/modulation values become unsafe or unpleasant.                              | Centralise bounds, clamp at the engine boundary, add master protection, and listening-test presets at safe volume.                                |
| Polyphony multiplies nodes and CPU cost.                                                    | Add it only after monophonic parity, use a bounded voice allocator, share appropriate nodes, profile representative hardware, and keep mono mode. |
| Scope expands into a DAW.                                                                   | Hold the first release to parity, polyphony, polish, tests, presets, and a local production build.                                                |
| Old generated files dominate reviews and history.                                           | Delete them in a dedicated cleanup commit after tagging legacy, separate from behaviour changes.                                                  |
| Audio tests are flaky across headless browsers.                                             | Put most logic behind pure functions/fakes, use offline rendering sparingly, and keep a documented manual audio/MIDI pass.                        |

## 10. Proposed issue/commit order

The following order produces reviewable commits and useful rollback points:

1. Rename the repository through its host and update the local remote while preserving Git history.
2. `docs: tag and document legacy Angular synth behaviour`
3. `chore: add MIT licence and modern project identity`
4. `build: add React TypeScript Vite and Dart Sass shell`
5. `chore: add lint formatting tests and local verify command`
6. `feat: add typed parameter and patch model`
7. `feat: add audio context lifecycle and master output`
8. `feat: add oscillator bank and monophonic note priority`
9. `feat: add noise mixer and dual filter routing`
10. `feat: add amp and filter envelope scheduling`
11. `feat: add LFO modulation routing`
12. `feat: rebuild delay with native audio nodes`
13. `feat: add computer and pointer keyboard input`
14. `feat: add original accessible SVG controls`
15. `feat: assemble responsive SCSS module synth panels`
16. `feat: add Web MIDI devices and note input`
17. `feat: add MIDI learn and persisted mappings`
18. `feat: add versioned presets and import export`
19. `feat: add analyser visualisation and UI polish`
20. `feat: add polyphonic voices and deterministic allocation`
21. `test: complete cross-browser smoke and accessibility coverage`
22. `docs: add portfolio README architecture and demo media`
23. `chore: remove legacy build generated files dependencies and UI assets`
24. `build: verify hosting-agnostic dist output`

Commits 6–20 should include their relevant unit/component tests. Do not defer all tests until commit 21; that commit is for completing browser-level coverage.

## 11. Definition of done

The modernisation is complete when:

- The application is React + strict TypeScript, starts with Vite, and builds as static assets.
- The repository and application have a framework-independent name while the complete original Git history remains available.
- A clean checkout installs reproducibly with `npm ci`.
- Angular, SystemJS, Gulp, Express, Pug, jQuery, copied dependencies, compiled source, and IDE build artefacts are gone from `main`.
- The old UI and knob assets are gone; the responsive interface and SVG controls are original to the modern project.
- The three oscillators, three noise colours, mixer, two filters, amp/filter envelopes, three LFOs, delay, polyphonic and monophonic voice modes, computer keyboard, on-screen keyboard, MIDI notes, and MIDI learn all work.
- Known legacy release/filter/piano/lifecycle bugs are fixed and protected by tests.
- Audio starts only after user consent and stops/disposes reliably.
- The UI is responsive, keyboard accessible, visibly polished, and usable without MIDI.
- Component styling uses SCSS Modules/Dart Sass with native CSS custom properties for design tokens.
- Presets and MIDI mappings persist safely.
- `npm run verify` locally runs formatting checks, typecheck, lint, unit/component tests, browser smoke tests, and the production build.
- `npm run build` creates a self-contained, hosting-agnostic `dist` directory.
- The project is MIT licensed.
- The project has a concise architecture explanation, signal-flow diagram, setup instructions, screenshots/video, and browser notes. Deployment and the eventual portfolio subdomain remain explicitly out of scope.

## 12. Reference documentation

- [React: Build a React app from scratch](https://react.dev/learn/build-a-react-app-from-scratch)
- [React: Creating a React app](https://react.dev/learn/creating-a-react-app)
- [Vite: Getting started](https://vite.dev/guide/)
- [Vite: Features and TypeScript behaviour](https://vite.dev/guide/features.html)
- [Sass documentation](https://sass-lang.com/documentation/)
- [Vitest: Getting started](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright: Browser projects](https://playwright.dev/docs/browsers)
- [MDN: Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN: Using AudioWorklet](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_AudioWorklet)
- [MDN: Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- [MDN: Secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts)
