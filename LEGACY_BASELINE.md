# Legacy Angular Synth Baseline

This document records the useful behaviour of the original Angular/Web Audio application before the SynthOfDoom rewrite.

- Reference tag: `legacy-angular`
- Reference commit: `4479d0755436a38d378a44cebc5de3154be6df48`
- Commit date: 31 January 2019
- Evidence: source inspection only

The obsolete application was deliberately not revived. Installing its Angular 4, TypeScript 2.5, SystemJS, Gulp 3, Express, and vendored browser dependency stack solely to capture screenshots or audio would add risk and work without improving the modern project. There are no external compatibility stakeholders, and the Git tag preserves the complete implementation if it is ever needed.

This is a behavioural guide, not a requirement for sample-identical audio or pixel-identical UI.

## Intentional legacy design

The original synth is monophonic with last-note priority. That is an intentional, conventional synthesiser design—not a defect or an accidental limitation.

The modern implementation sequence will initially reproduce a monophonic signal path because it is easier to verify one voice at a time. SynthOfDoom's first modern release will then add bounded polyphony and default to polyphonic operation. An optional mono/legato mode may remain useful for basses, leads, and portamento patches.

Other intentional design choices worth carrying forward are:

- Three independently configurable oscillators.
- A selectable white, pink, or brown noise source.
- Per-source level/on-off control.
- Per-source crossfade routing into two parallel filters.
- Separate filter envelopes and a shared amplitude envelope in the legacy graph.
- Three freely assignable LFOs.
- Delay with feedback filtering, saturation, wet/dry mix, and bypass.
- Computer keyboard, Web MIDI note input, and MIDI CC learn.

The old fixed layout, graphics, component structure, and framework coupling are not part of the design contract.

## Legacy signal flow

```text
Oscillator 1 --\
Oscillator 2 ---\
Oscillator 3 ----> source level/on + Filter 1/2 crossfade ---> Filter 1 --\
Noise -----------/                                         \-> Filter 2 ----> Amp ADSR ---> Delay ---> destination

LFO 1/2/3 ---> one selected oscillator-detune or filter-cutoff AudioParam

Computer keys -----\
MIDI notes ---------> monophonic note/velocity input
MIDI CC ------------> learned knob target
```

## Source-derived defaults and ranges

These values describe the source code and visible control intent. Known initialization bugs are called out separately.

### Oscillators (three identical modules)

| Parameter | Default | Range/options |
| --- | ---: | --- |
| Waveform | Sawtooth | Sine, sawtooth, square, triangle |
| Octave | 0 | -2, -1, 0, +1, +2 octaves |
| Detune | 0 cents | -100 to +100 cents |
| Portamento | 0.05 time constant | Hard-coded; no legacy UI control |

- Pitch uses MIDI note to equal-tempered frequency with A4/MIDI 69 at 440 Hz.
- Octave-transposed note numbers are clamped to MIDI 1–127.
- All three continuously running oscillators follow the one active monophonic pitch.

### Noise

| Parameter | Default | Options |
| --- | --- | --- |
| Colour | White | White, pink, brown |

- Each colour is generated into a two-second mono looping `AudioBuffer`.

### Mixer and dual-filter routing

| Parameter | Default | Range/options |
| --- | ---: | --- |
| Source level | 0.8 | 0–1 |
| Filter 1/2 crossfade | 50% / 50% | Linear 0–100% |
| Source enabled | On | On/off |

- Channels are Oscillator 1, Oscillator 2, Oscillator 3, and Noise.
- Each source has independent gains feeding both filter outputs.

### Filters (two identical modules)

| Parameter | Default | Range/options |
| --- | ---: | --- |
| Type | Low-pass | Low-pass, high-pass, band-pass, low-shelf, high-shelf, peaking, notch, all-pass |
| Cutoff | 1000 Hz | 60–10,000 Hz |
| Resonance/Q | 2 | 1–16 |
| Gain | 0 dB | -24 to +24 dB where applicable |
| Envelope depth | 0 | -1 to +1 |
| Envelope attack | 0.5 s | 0–2 s |
| Envelope decay | 0.5 s | 0–2 s |
| Envelope sustain | 0.5 | 0–1 |
| Envelope release | Intended 0.5 s | 0–2 s |

- Positive depth moves cutoff toward the upper bound; negative depth moves it toward the lower bound.

### Amplitude envelope

| Parameter | Default | Range |
| --- | ---: | --- |
| Attack | 0.5 s | 0–2 s |
| Decay | 0.5 s | 0–2 s |
| Sustain | 0.5 | 0–1 |
| Release | Intended 0.5 s | 0–2 s |

- MIDI velocity is normalised from 0–127 and sets the peak amplitude.

### LFOs (three identical modules)

| Parameter | Default | Range/options |
| --- | ---: | --- |
| Waveform | Sine | Sine, sawtooth, square, triangle |
| Rate | 1 Hz | 0.1–20.1 Hz |
| Depth | UI initially shows 0.5 | Target-dependent |
| Target | None | Oscillator 1/2/3 detune; Filter 1/2 cutoff |

- Each LFO is a continuously running oscillator feeding a gain node connected to the selected target `AudioParam`.

### Delay

| Parameter | Default/control intent | Range/options |
| --- | ---: | --- |
| Enabled | Off | On/off |
| Time | 0.5 s | 0.01–2 s |
| Feedback | 0.5 | 0–1 |
| Feedback low-pass | 1000 Hz | 200–5,000 Hz |
| Wet/dry mix | Control shows 50% | 0–100% |

- The feedback loop is delay → feedback gain → low-pass filter → delay.
- The wet path includes sigmoid saturation and makeup gain.

### Computer keyboard

| Key | MIDI note | Note |
| --- | ---: | --- |
| Q | 60 | C4 |
| 2 | 61 | C♯4 |
| W | 62 | D4 |
| 3 | 63 | D♯4 |
| E | 64 | E4 |
| R | 65 | F4 |
| 5 | 66 | F♯4 |
| T | 67 | G4 |
| 6 | 68 | G♯4 |
| Y | 69 | A4 |
| 7 | 70 | A♯4 |
| U | 71 | B4 |
| I | 72 | C5 |

- Computer-key velocity is fixed at 100.

### Web MIDI and MIDI learn

- All MIDI channels are accepted; the channel nibble is ignored.
- Note-on with non-zero velocity starts a note.
- Note-on with zero velocity is treated as note-off.
- Note-off releases a note.
- Control-change messages expose controller number and value.
- MIDI learn maps one CC number to a registered knob target for the current session.
- Mappings are not persisted.
- Device hot-plug, device selection, permission state, and user-facing errors are not implemented.

## Known defects and behaviours not to preserve

- Amp envelope release control writes to `sustain` rather than `release`.
- Both filter envelope release controls write to `sustain` rather than `release`.
- Shelf-filter control initialization wires the wrong knob in one branch.
- Audio scheduling frequently uses absolute time `0` rather than `audioContext.currentTime`.
- Envelope retrigger/release scheduling can introduce discontinuities and clicks.
- `AudioContext` is created eagerly and only explicitly resumed by a keydown listener.
- Delay saturation uses deprecated main-thread `ScriptProcessorNode` and assumes stereo buffers.
- Delay mix's displayed initial value does not reliably initialize the underlying wet/dry gains.
- Angular `AfterViewChecked` repeatedly initializes knobs, registers MIDI targets, and forces change detection.
- Global keyboard/pointer listeners are not consistently cleaned up.
- MIDI initialization is manually invoked as though a service were an Angular component.
- MIDI target IDs are derived from labels and may be registered repeatedly.
- The on-screen piano is visual only and uses delayed jQuery merely for highlighting.
- The UI is absolutely positioned at a fixed 800 px width and is not accessible or responsive.
- There is no master output protection, preset model, persisted state, automated test coverage, or useful error/status UI.

## Modern parity checklist

This checklist tracks functional intent, not legacy implementation details:

- [ ] Three oscillators support waveform, octave, and detune.
- [ ] Pitch and velocity respond correctly to unified note input.
- [ ] White, pink, and brown noise are available.
- [ ] Four source channels support level, enable, and dual-filter routing.
- [ ] Both filters support the useful legacy filter types and appropriate Q/gain controls.
- [ ] Amp and filter ADSR envelopes schedule cleanly and expose working release controls.
- [ ] Three LFOs can route safely to oscillator detune and filter cutoff.
- [ ] Delay provides time, feedback, feedback filtering, saturation, mix, and bypass using modern nodes.
- [ ] Computer keyboard note input works without stuck notes.
- [ ] The on-screen keyboard plays notes by pointer/touch and reflects all active-note sources.
- [ ] Web MIDI notes work when supported, with visible permission/device status.
- [ ] MIDI CC learn uses stable parameter IDs and persisted mappings.
- [ ] Polyphonic voices have independent filters/envelopes and deterministic voice stealing.
- [ ] Polyphony is the modern default; optional mono/legato mode preserves useful classic behaviour.
- [ ] All legacy defects listed above are fixed or deliberately superseded.

## Phase 0 conclusion

The repository name/history, `legacy-angular` tag, source-derived baseline, keyboard map, defaults, design decisions, and known defects are now documented. No legacy install or runtime capture is required. Phase 0 is complete.
