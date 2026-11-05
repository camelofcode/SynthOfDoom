import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('identifies the application and operational synth interface', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Preset controls' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Preset')).toHaveValue('factory:init');
    expect(screen.getByText('Preset actions')).toBeInTheDocument();
    expect(screen.getByLabelText('Synth accent colour')).toHaveValue('#76d04b');
    expect(
      screen.queryByLabelText('Performance Voice mode'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('slider', { name: 'Performance Voices' }),
    ).toHaveValue('8');
    expect(screen.getByRole('button', { name: 'Start audio' })).toBeEnabled();
    expect(
      screen.getByRole('heading', { name: 'Audio: Ready to start' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Piano keyboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C4' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'C4' })).toHaveAttribute(
      'data-audio-locked',
    );
    expect(screen.getByRole('button', { name: 'C6' })).toBeEnabled();
    expect(
      screen.queryByLabelText('MIDI learn target'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Sources & mixer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', {
        name: 'Sources & mixer: Oscillator 1',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', {
        name: 'Sources & mixer: Noise',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('slider', { name: 'Filter 1 Cutoff' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('slider', { name: 'Filter 2 Cutoff' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Delay & output' }),
    ).toBeInTheDocument();
  });

  it('lists the complete audio and input modules', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Sources & mixer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Keyboard and MIDI' }),
    ).toBeInTheDocument();
  });
});
