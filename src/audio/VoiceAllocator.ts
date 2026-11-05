export type VoiceStatus = 'idle' | 'active' | 'released';

export interface VoiceSlot {
  readonly index: number;
  readonly status: VoiceStatus;
  readonly note: number | null;
  readonly startedOrder: number;
  readonly releasedOrder: number;
}

export interface VoiceAllocation {
  readonly index: number;
  readonly previousNote: number | null;
  readonly stolen: boolean;
  readonly retriggered: boolean;
}

export class VoiceAllocator {
  private order = 0;
  private slots: VoiceSlot[];

  constructor(readonly capacity: number) {
    if (!Number.isInteger(capacity) || capacity < 1) {
      throw new RangeError('Voice capacity must be a positive integer.');
    }
    this.slots = Array.from({ length: capacity }, (_, index) => ({
      index,
      status: 'idle' as const,
      note: null,
      startedOrder: 0,
      releasedOrder: 0,
    }));
  }

  allocate(note: number): VoiceAllocation {
    const repeated = this.slots.find(
      (slot) => slot.status === 'active' && slot.note === note,
    );
    const selected =
      repeated ??
      this.slots.find((slot) => slot.status === 'idle') ??
      this.oldest('released', 'releasedOrder') ??
      this.oldest('active', 'startedOrder');

    if (!selected) throw new Error('Voice allocator has no available slot.');

    const allocation: VoiceAllocation = {
      index: selected.index,
      previousNote: selected.note,
      stolen: selected.status !== 'idle' && !repeated,
      retriggered: Boolean(repeated),
    };
    this.slots[selected.index] = {
      index: selected.index,
      status: 'active',
      note,
      startedOrder: ++this.order,
      releasedOrder: 0,
    };
    return allocation;
  }

  release(note: number): number | null {
    const selected = this.slots.find(
      (slot) => slot.status === 'active' && slot.note === note,
    );
    if (!selected) return null;
    this.slots[selected.index] = {
      ...selected,
      status: 'released',
      releasedOrder: ++this.order,
    };
    return selected.index;
  }

  releaseAll(): readonly number[] {
    const released: number[] = [];
    for (const slot of this.slots) {
      if (slot.status !== 'active') continue;
      released.push(slot.index);
      this.slots[slot.index] = {
        ...slot,
        status: 'released',
        releasedOrder: ++this.order,
      };
    }
    return released;
  }

  getSlots(): readonly VoiceSlot[] {
    return this.slots;
  }

  private oldest(
    status: Exclude<VoiceStatus, 'idle'>,
    order: 'startedOrder' | 'releasedOrder',
  ): VoiceSlot | undefined {
    return this.slots
      .filter((slot) => slot.status === status)
      .sort((left, right) => left[order] - right[order])[0];
  }
}
