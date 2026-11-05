import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('identifies the application and preset memory phase', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Phase 7 · Presets')).toBeInTheDocument();
    expect(
      screen.getByRole('region', { name: 'Preset controls' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Preset')).toHaveValue('factory:init');
    expect(screen.getByRole('button', { name: 'Start audio' })).toBeEnabled();
    expect(
      screen.getByRole('heading', { name: 'Audio: Ready to start' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Piano keyboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C4' })).toBeDisabled();
    expect(
      screen.getByRole('region', { name: 'Oscillators' }),
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
      screen.getByRole('heading', { name: 'Oscillators' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Keyboard and MIDI' }),
    ).toBeInTheDocument();
  });
});
