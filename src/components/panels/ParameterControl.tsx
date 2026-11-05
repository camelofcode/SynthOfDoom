import { midiLearn } from '../../input/inputInstance';
import type {
  ParameterDefinition,
  ParameterValue,
} from '../../synth/parameters';
import type { ParameterId } from '../../synth/types';
import { Knob } from '../controls/Knob';
import { Select } from '../controls/Select';
import { Toggle } from '../controls/Toggle';
import styles from './SynthInterface.module.scss';

export function ParameterControl({
  definition,
  value,
  onChange,
  learnedCc,
  learning,
}: {
  readonly definition: ParameterDefinition;
  readonly value: ParameterValue;
  readonly onChange: (value: ParameterValue) => void;
  readonly learnedCc?: number;
  readonly learning: boolean;
}) {
  const control =
    definition.kind === 'number' && typeof value === 'number' ? (
      <Knob
        definition={definition}
        value={value}
        onChange={onChange}
        accessibleLabel={`${definition.group} ${definition.label}`}
      />
    ) : definition.kind === 'boolean' && typeof value === 'boolean' ? (
      <Toggle
        label={definition.label}
        checked={value}
        onChange={onChange}
        accessibleLabel={`${definition.group} ${definition.label}`}
      />
    ) : definition.kind === 'enum' && typeof value === 'string' ? (
      <Select
        label={definition.label}
        value={value}
        options={definition.options}
        onChange={onChange}
        accessibleLabel={`${definition.group} ${definition.label}`}
      />
    ) : null;

  return (
    <div className={styles.parameterControl}>
      {control}
      {definition.midiLearnable ? (
        <button
          className={styles.learnButton}
          type="button"
          aria-pressed={learning}
          onClick={() =>
            learning
              ? midiLearn.cancel()
              : midiLearn.begin(definition.id as ParameterId)
          }
        >
          {learning
            ? 'Listening for CC…'
            : learnedCc === undefined
              ? 'MIDI learn'
              : `CC ${learnedCc}`}
        </button>
      ) : null}
    </div>
  );
}
