import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('identifies the application and current unified-input phase', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Phase 4 · Unified input')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start audio' })).toBeEnabled();
    expect(
      screen.getByRole('heading', { name: 'Audio: Ready to start' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('group', { name: 'Piano keyboard' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'C4' })).toBeDisabled();
    expect(
      screen.getByRole('region', { name: 'Planned synth modules' }),
    ).toBeInTheDocument();
  });

  it('lists the planned audio and input modules', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { name: 'Oscillator bank' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'Keyboard and MIDI' }),
    ).toBeInTheDocument();
  });
});
