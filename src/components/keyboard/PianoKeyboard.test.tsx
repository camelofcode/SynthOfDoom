import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { noteRouter } from '../../input/inputInstance';
import { PianoKeyboard } from './PianoKeyboard';

afterEach(() => vi.restoreAllMocks());

describe('PianoKeyboard audio activation', () => {
  it('starts audio and plays a held first pointer note', async () => {
    const noteOn = vi.spyOn(noteRouter, 'noteOn').mockImplementation(() => {});
    const noteOff = vi
      .spyOn(noteRouter, 'noteOff')
      .mockImplementation(() => {});
    const startAudio = vi.fn().mockResolvedValue(undefined);
    render(
      <PianoKeyboard
        activeNotes={[]}
        audioReady={false}
        onRequestAudio={startAudio}
      />,
    );

    const c4 = screen.getByRole('button', { name: 'C4' });
    fireEvent.pointerDown(c4, { pointerId: 12, buttons: 1 });
    await waitFor(() => expect(noteOn).toHaveBeenCalled());
    expect(startAudio).toHaveBeenCalledOnce();
    expect(noteOn).toHaveBeenCalledWith(
      { source: 'pointer', sourceId: '12' },
      60,
      100 / 127,
    );

    fireEvent.pointerUp(c4, { pointerId: 12, buttons: 0 });
    expect(noteOff).toHaveBeenCalledWith(
      { source: 'pointer', sourceId: '12' },
      60,
    );
  });

  it('cancels a first pointer note released while audio is starting', async () => {
    const noteOn = vi.spyOn(noteRouter, 'noteOn').mockImplementation(() => {});
    vi.spyOn(noteRouter, 'noteOff').mockImplementation(() => {});
    let finishStarting: (() => void) | undefined;
    const startAudio = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finishStarting = resolve;
        }),
    );
    render(
      <PianoKeyboard
        activeNotes={[]}
        audioReady={false}
        onRequestAudio={startAudio}
      />,
    );

    const c4 = screen.getByRole('button', { name: 'C4' });
    fireEvent.pointerDown(c4, { pointerId: 13, buttons: 1 });
    fireEvent.pointerUp(c4, { pointerId: 13, buttons: 0 });
    await act(async () => finishStarting?.());

    expect(noteOn).not.toHaveBeenCalled();
  });
});
