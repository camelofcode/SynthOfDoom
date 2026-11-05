import { useMidiLearn } from '../../hooks/useMidiLearn';
import { usePatch } from '../../hooks/usePatch';
import {
  PARAMETER_REGISTRY,
  type ParameterValue,
} from '../../synth/parameters';
import type { ParameterId } from '../../synth/types';
import { Panel } from '../controls/Panel';
import { ParameterControl } from './ParameterControl';
import styles from './SynthInterface.module.scss';

const groups: readonly {
  title: string;
  eyebrow: string;
  className?: string;
  ids: readonly ParameterId[];
}[] = [
  {
    title: 'Oscillators',
    eyebrow: 'Sources 01–03',
    className: styles.sources,
    ids: [
      'oscillator.1.waveform',
      'oscillator.1.octave',
      'oscillator.1.detune',
      'oscillator.2.waveform',
      'oscillator.2.octave',
      'oscillator.2.detune',
      'oscillator.3.waveform',
      'oscillator.3.octave',
      'oscillator.3.detune',
      'noise.colour',
    ],
  },
  {
    title: 'Mixer & routing',
    eyebrow: 'Four sources · two filters',
    className: styles.mixer,
    ids: [
      'mixer.oscillator.1.enabled',
      'mixer.oscillator.1.level',
      'mixer.oscillator.1.filterBalance',
      'mixer.oscillator.2.enabled',
      'mixer.oscillator.2.level',
      'mixer.oscillator.2.filterBalance',
      'mixer.oscillator.3.enabled',
      'mixer.oscillator.3.level',
      'mixer.oscillator.3.filterBalance',
      'mixer.noise.enabled',
      'mixer.noise.level',
      'mixer.noise.filterBalance',
    ],
  },
  {
    title: 'Dual filters',
    eyebrow: 'Parallel tone shaping',
    className: styles.filters,
    ids: [
      'filter.1.type',
      'filter.1.cutoff',
      'filter.1.resonance',
      'filter.1.gain',
      'filter.1.envelope.amount',
      'filter.1.envelope.attack',
      'filter.1.envelope.decay',
      'filter.1.envelope.sustain',
      'filter.1.envelope.release',
      'filter.2.type',
      'filter.2.cutoff',
      'filter.2.resonance',
      'filter.2.gain',
      'filter.2.envelope.amount',
      'filter.2.envelope.attack',
      'filter.2.envelope.decay',
      'filter.2.envelope.sustain',
      'filter.2.envelope.release',
    ],
  },
  {
    title: 'Modulation',
    eyebrow: 'Three global LFOs',
    className: styles.modulation,
    ids: [
      'lfo.1.waveform',
      'lfo.1.rate',
      'lfo.1.depth',
      'lfo.1.target',
      'lfo.2.waveform',
      'lfo.2.rate',
      'lfo.2.depth',
      'lfo.2.target',
      'lfo.3.waveform',
      'lfo.3.rate',
      'lfo.3.depth',
      'lfo.3.target',
    ],
  },
  {
    title: 'Performance',
    eyebrow: 'Polyphony & glide',
    className: styles.performance,
    ids: [
      'performance.voiceMode',
      'performance.voiceCount',
      'performance.portamento',
    ],
  },
  {
    title: 'Amplitude',
    eyebrow: 'Velocity-sensitive ADSR',
    className: styles.amplitude,
    ids: [
      'amp.envelope.attack',
      'amp.envelope.decay',
      'amp.envelope.sustain',
      'amp.envelope.release',
    ],
  },
  {
    title: 'Delay & output',
    eyebrow: 'Native-node effect',
    className: styles.effects,
    ids: [
      'delay.enabled',
      'delay.time',
      'delay.feedback',
      'delay.feedbackCutoff',
      'delay.mix',
      'delay.saturation',
    ],
  },
];

export function SynthInterface() {
  const { patch, setParameter } = usePatch();
  const learn = useMidiLearn();
  const ccById = new Map(
    learn.bindings.map(({ controller, parameterId }) => [
      parameterId,
      controller,
    ]),
  );

  return (
    <div className={styles.synthGrid} aria-label="Synthesiser controls">
      {groups.map((group) => (
        <div className={group.className} key={group.title}>
          <Panel title={group.title} eyebrow={group.eyebrow}>
            <div className={styles.controlGrid}>
              {group.ids.map((id) => {
                const definition = PARAMETER_REGISTRY[id];
                return (
                  <ParameterControl
                    key={id}
                    definition={definition}
                    value={patch.parameters[id]}
                    learnedCc={ccById.get(id)}
                    learning={learn.learning === id}
                    onChange={(value: ParameterValue) =>
                      setParameter(id, value)
                    }
                  />
                );
              })}
            </div>
          </Panel>
        </div>
      ))}
    </div>
  );
}
