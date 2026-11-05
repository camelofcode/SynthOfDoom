import { describe, expect, it, vi } from 'vitest';
import { NoteRouter, type NoteTarget } from './NoteRouter';

function target(): NoteTarget {
  return { noteOn: vi.fn(), noteOff: vi.fn(), allNotesOff: vi.fn() };
}

describe('NoteRouter', () => {
  it('keeps a note held until every input owner releases it', () => {
    const synth = target();
    const router = new NoteRouter(synth);
    const computer = { source: 'computer' as const, sourceId: 'keys' };
    const midi = { source: 'midi' as const, sourceId: 'device' };
    router.noteOn(computer, 60, 0.8);
    router.noteOn(midi, 60, 0.5);
    expect(synth.noteOn).toHaveBeenCalledOnce();
    router.noteOff(computer, 60);
    expect(synth.noteOff).not.toHaveBeenCalled();
    router.noteOff(midi, 60);
    expect(synth.noteOff).toHaveBeenCalledWith(60);
  });

  it('releases only the selected source and publishes active notes', () => {
    const synth = target();
    const router = new NoteRouter(synth);
    router.noteOn({ source: 'computer', sourceId: 'keys' }, 64);
    router.noteOn({ source: 'midi', sourceId: 'a' }, 60);
    router.allNotesOff({ source: 'midi' });
    expect(router.getSnapshot().activeNotes).toEqual([64]);
    expect(synth.noteOff).toHaveBeenCalledWith(60);
    router.allNotesOff();
    expect(synth.allNotesOff).toHaveBeenCalledOnce();
  });

  it('counts repeated note-ons from one owner until every press releases', () => {
    const synth = target();
    const router = new NoteRouter(synth);
    const midi = { source: 'midi' as const, sourceId: 'device' };

    router.noteOn(midi, 60, 0.7);
    router.noteOn(midi, 60, 0.9);
    expect(synth.noteOn).toHaveBeenCalledOnce();

    router.noteOff(midi, 60);
    expect(synth.noteOff).not.toHaveBeenCalled();
    expect(router.getSnapshot().activeNotes).toEqual([60]);

    router.noteOff(midi, 60);
    expect(synth.noteOff).toHaveBeenCalledWith(60);
    expect(router.getSnapshot().activeNotes).toEqual([]);
  });
});
