import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import {
  getParameterDefinition,
  type NumericParameterDefinition,
} from '../../synth/parameters';
import { Knob } from './Knob';
import { Panel } from './Panel';
import { Select } from './Select';
import { Toggle } from './Toggle';
import { StatusIndicator, ValueReadout } from './ValueReadout';

const cutoff = getParameterDefinition(
  'filter.1.cutoff',
) as NumericParameterDefinition;

function ControlledKnob({ disabled = false }: { readonly disabled?: boolean }) {
  const [value, setValue] = useState(1000);
  return (
    <Knob
      definition={cutoff}
      value={value}
      onChange={setValue}
      disabled={disabled}
    />
  );
}

describe('Knob', () => {
  it('exposes slider semantics, visible value text, and original SVG art', () => {
    render(<ControlledKnob />);
    const slider = screen.getByRole('slider', { name: 'Cutoff' });
    expect(slider).toHaveAttribute('min', '60');
    expect(slider).toHaveAttribute('max', '10000');
    expect(slider).toHaveAttribute('aria-valuetext', '1 kHz');
    expect(screen.getByText('1 kHz')).toBeVisible();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('supports arrows, page keys, Home/End, range input, and reset', async () => {
    const user = userEvent.setup();
    render(<ControlledKnob />);
    const slider = screen.getByRole('slider', { name: 'Cutoff' });
    slider.focus();

    await user.keyboard('{ArrowUp}');
    expect(slider).toHaveValue('1001');
    await user.keyboard('{PageUp}');
    expect(slider).toHaveValue('1995');
    await user.keyboard('{End}');
    expect(slider).toHaveValue('10000');
    await user.keyboard('{Home}');
    expect(slider).toHaveValue('60');
    fireEvent.change(slider, { target: { value: '2500' } });
    expect(slider).toHaveValue('2500');
    fireEvent.doubleClick(slider);
    expect(slider).toHaveValue('1000');
    fireEvent.change(slider, { target: { value: '2500' } });
    await user.click(
      screen.getByRole('button', { name: 'Reset Cutoff to default' }),
    );
    expect(slider).toHaveValue('1000');
  });

  it('clamps external values and honours disabled state', () => {
    render(
      <Knob definition={cutoff} value={50_000} onChange={vi.fn()} disabled />,
    );
    expect(screen.getByRole('slider', { name: 'Cutoff' })).toHaveValue('10000');
    expect(screen.getByRole('slider', { name: 'Cutoff' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'Reset Cutoff to default' }),
    ).toBeDisabled();
  });
});

describe('control primitives', () => {
  it('toggles with explicit text as well as visual state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Toggle label="Delay" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('button', { name: 'Delay: Off' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('renders labelled selects, panels, readouts, and textual statuses', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <Panel title="Oscillator" eyebrow="Source">
        <Select
          label="Waveform"
          value="sine"
          options={[
            { value: 'sine', label: 'Sine' },
            { value: 'square', label: 'Square' },
          ]}
          onChange={onChange}
        />
        <ValueReadout label="Level" value="80%" />
        <StatusIndicator label="Signal" status="active" />
      </Panel>,
    );
    expect(
      screen.getByRole('region', { name: 'Oscillator' }),
    ).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Waveform'), 'square');
    expect(onChange).toHaveBeenCalledWith('square');
    expect(screen.getByText('80%')).toBeVisible();
    expect(
      screen.getByRole('status', { name: 'Signal: active' }),
    ).toHaveTextContent('Signal: active');
  });
});
