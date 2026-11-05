import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('identifies the application and current domain phase', () => {
    render(<App />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'SynthOfDoom' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Phase 2 · Domain model')).toBeInTheDocument();
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
      screen.getByRole('heading', { name: 'Keyboard and MIDI' }),
    ).toBeInTheDocument();
  });
});
