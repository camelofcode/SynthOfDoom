import { useState } from 'react';

import { synthEngine } from '../../audio/engineInstance';
import {
  getParameterDefinition,
  type EnumParameterDefinition,
  type NumericParameterDefinition,
} from '../../synth/parameters';
import type { OscillatorWaveform } from '../../synth/types';
import styles from './ControlShowcase.module.scss';
import { Knob } from './Knob';
import { Panel } from './Panel';
import { Select } from './Select';
import { Toggle } from './Toggle';
import { StatusIndicator, ValueReadout } from './ValueReadout';

const cutoffDefinition = getParameterDefinition(
  'filter.1.cutoff',
) as NumericParameterDefinition;
const waveformDefinition = getParameterDefinition(
  'oscillator.1.waveform',
) as EnumParameterDefinition<'oscillator.1.waveform', OscillatorWaveform>;

export function ControlShowcase() {
  const initialPatch = synthEngine.getPatch().parameters;
  const [cutoff, setCutoff] = useState(initialPatch['filter.1.cutoff']);
  const [waveform, setWaveform] = useState(
    initialPatch['oscillator.1.waveform'],
  );
  const [delayEnabled, setDelayEnabled] = useState(
    initialPatch['delay.enabled'],
  );

  const changeCutoff = (value: number) => {
    const applied = synthEngine.setParameter('filter.1.cutoff', value);
    setCutoff(applied as number);
  };

  const changeWaveform = (value: OscillatorWaveform) => {
    synthEngine.setParameter('oscillator.1.waveform', value);
    setWaveform(value);
  };

  const changeDelay = (value: boolean) => {
    synthEngine.setParameter('delay.enabled', value);
    setDelayEnabled(value);
  };

  return (
    <Panel
      title="Control foundation"
      eyebrow="Accessible primitives"
      actions={<StatusIndicator label="Controls" status="active" />}
    >
      <div className={styles.controlRow}>
        <Knob
          definition={cutoffDefinition}
          value={cutoff}
          onChange={changeCutoff}
        />
        <div className={styles.simpleControls}>
          <Select
            label="Oscillator 1 waveform"
            value={waveform}
            options={waveformDefinition.options}
            onChange={changeWaveform}
          />
          <Toggle label="Delay" checked={delayEnabled} onChange={changeDelay} />
          <ValueReadout
            label="Filter 1 cutoff"
            value={cutoffDefinition.formatValue(cutoff)}
          />
        </div>
      </div>
    </Panel>
  );
}
