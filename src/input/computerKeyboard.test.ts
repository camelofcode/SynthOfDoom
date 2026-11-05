import { describe, expect, it, vi } from 'vitest';
import { NoteRouter, type NoteTarget } from './NoteRouter';
import { attachComputerKeyboard } from './computerKeyboard';

describe('computer keyboard adapter', () => {
  it('plays mapped keys, ignores repeats, shifts octaves, and releases on blur', () => {
    const target: NoteTarget = {
      noteOn: vi.fn(),
      noteOff: vi.fn(),
      allNotesOff: vi.fn(),
    };
    const router = new NoteRouter(target);
    const dispose = attachComputerKeyboard({
      window,
      document,
      router,
      isActive: () => true,
    });
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ' }));
    window.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', repeat: true }),
    );
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyQ' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ' }));
    expect(target.noteOn).toHaveBeenNthCalledWith(1, 60, 100 / 127);
    expect(target.noteOn).toHaveBeenNthCalledWith(2, 72, 100 / 127);
    window.dispatchEvent(new Event('blur'));
    expect(target.noteOff).toHaveBeenCalledWith(72);
    dispose();
  });

  it('does not capture input fields or inactive synths', () => {
    const target: NoteTarget = {
      noteOn: vi.fn(),
      noteOff: vi.fn(),
      allNotesOff: vi.fn(),
    };
    const router = new NoteRouter(target);
    const input = document.createElement('input');
    document.body.append(input);
    const dispose = attachComputerKeyboard({
      window,
      document,
      router,
      isActive: () => false,
    });
    input.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', bubbles: true }),
    );
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyQ' }));
    expect(target.noteOn).not.toHaveBeenCalled();
    dispose();
    input.remove();
  });

  it('continues playing notes while a range slider has focus', () => {
    const target: NoteTarget = {
      noteOn: vi.fn(),
      noteOff: vi.fn(),
      allNotesOff: vi.fn(),
    };
    const router = new NoteRouter(target);
    const range = document.createElement('input');
    range.type = 'range';
    document.body.append(range);
    const dispose = attachComputerKeyboard({
      window,
      document,
      router,
      isActive: () => true,
    });

    range.dispatchEvent(
      new KeyboardEvent('keydown', { code: 'KeyQ', bubbles: true }),
    );
    range.dispatchEvent(
      new KeyboardEvent('keyup', { code: 'KeyQ', bubbles: true }),
    );

    expect(target.noteOn).toHaveBeenCalledWith(60, 100 / 127);
    expect(target.noteOff).toHaveBeenCalledWith(60);
    dispose();
    range.remove();
  });
});
