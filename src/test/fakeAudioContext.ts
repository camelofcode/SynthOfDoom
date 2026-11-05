import type {
  AnalyserNodePort,
  AudioBufferPort,
  AudioBufferSourceNodePort,
  AudioContextPort,
  AudioContextRuntimeState,
  AudioNodePort,
  AudioParamPort,
  BiquadFilterNodePort,
  DelayNodePort,
  DynamicsCompressorNodePort,
  GainNodePort,
  OscillatorNodePort,
  WaveShaperNodePort,
} from '../audio/contracts';

export interface FakeAudioParamEvent {
  readonly type: 'cancel' | 'hold' | 'set' | 'linear-ramp' | 'target';
  readonly value?: number;
  readonly time: number;
  readonly timeConstant?: number;
}

export class FakeAudioParam implements AudioParamPort {
  readonly events: FakeAudioParamEvent[] = [];

  constructor(public value = 0) {}

  cancelScheduledValues(startTime: number): AudioParamPort {
    this.events.push({ type: 'cancel', time: startTime });
    return this;
  }

  cancelAndHoldAtTime(cancelTime: number): AudioParamPort {
    this.events.push({ type: 'hold', time: cancelTime });
    return this;
  }

  setValueAtTime(value: number, startTime: number): AudioParamPort {
    this.value = value;
    this.events.push({ type: 'set', value, time: startTime });
    return this;
  }

  linearRampToValueAtTime(value: number, endTime: number): AudioParamPort {
    this.value = value;
    this.events.push({ type: 'linear-ramp', value, time: endTime });
    return this;
  }

  setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number,
  ): AudioParamPort {
    this.value = target;
    this.events.push({
      type: 'target',
      value: target,
      time: startTime,
      timeConstant,
    });
    return this;
  }
}

export class FakeAudioNode implements AudioNodePort {
  readonly connections: Array<AudioNodePort | AudioParamPort> = [];
  disconnectCalls = 0;

  connect(destination: AudioNodePort | AudioParamPort): void {
    this.connections.push(destination);
  }

  disconnect(): void {
    this.connections.length = 0;
    this.disconnectCalls += 1;
  }
}

export class FakeGainNode extends FakeAudioNode implements GainNodePort {
  readonly gain = new FakeAudioParam(1);
}

export class FakeOscillatorNode
  extends FakeAudioNode
  implements OscillatorNodePort
{
  type: OscillatorType = 'sine';
  readonly frequency = new FakeAudioParam(440);
  readonly detune = new FakeAudioParam(0);
  startCalls = 0;
  stopCalls = 0;

  start(): void {
    this.startCalls += 1;
  }

  stop(): void {
    this.stopCalls += 1;
  }
}

export class FakeBiquadFilterNode
  extends FakeAudioNode
  implements BiquadFilterNodePort
{
  type: BiquadFilterType = 'lowpass';
  readonly frequency = new FakeAudioParam(350);
  readonly Q = new FakeAudioParam(1);
  readonly gain = new FakeAudioParam(0);
}

export class FakeDelayNode extends FakeAudioNode implements DelayNodePort {
  readonly delayTime = new FakeAudioParam(0);
}

export class FakeWaveShaperNode
  extends FakeAudioNode
  implements WaveShaperNodePort
{
  curve: Float32Array<ArrayBuffer> | null = null;
  oversample: OverSampleType = 'none';
}

export class FakeDynamicsCompressorNode
  extends FakeAudioNode
  implements DynamicsCompressorNodePort
{
  readonly threshold = new FakeAudioParam(-24);
  readonly knee = new FakeAudioParam(30);
  readonly ratio = new FakeAudioParam(12);
  readonly attack = new FakeAudioParam(0.003);
  readonly release = new FakeAudioParam(0.25);
}

export class FakeAnalyserNode
  extends FakeAudioNode
  implements AnalyserNodePort
{
  fftSize = 2048;
  smoothingTimeConstant = 0.8;

  get frequencyBinCount(): number {
    return this.fftSize / 2;
  }

  getByteTimeDomainData(array: Uint8Array<ArrayBuffer>): void {
    array.fill(128);
  }

  getByteFrequencyData(array: Uint8Array<ArrayBuffer>): void {
    array.fill(0);
  }
}

class FakeAudioBuffer implements AudioBufferPort {
  private readonly channels: Float32Array[];

  constructor(
    numberOfChannels: number,
    readonly length: number,
    readonly sampleRate: number,
  ) {
    this.channels = Array.from(
      { length: numberOfChannels },
      () => new Float32Array(length),
    );
  }

  getChannelData(channel: number): Float32Array {
    const data = this.channels[channel];
    if (!data) throw new RangeError(`Missing audio channel ${channel}.`);
    return data;
  }
}

export class FakeAudioBufferSourceNode
  extends FakeAudioNode
  implements AudioBufferSourceNodePort
{
  buffer: AudioBufferPort | null = null;
  loop = false;
  startCalls = 0;
  stopCalls = 0;

  start(): void {
    this.startCalls += 1;
  }

  stop(): void {
    this.stopCalls += 1;
  }
}

export class FakeAudioContext implements AudioContextPort {
  readonly destination = new FakeAudioNode();
  readonly sampleRate = 100;
  currentTime = 0;
  state: AudioContextRuntimeState = 'suspended';
  onstatechange: (() => void) | null = null;
  resumeCalls = 0;
  closeCalls = 0;
  readonly gains: FakeGainNode[] = [];
  readonly oscillators: FakeOscillatorNode[] = [];
  readonly filters: FakeBiquadFilterNode[] = [];
  readonly delays: FakeDelayNode[] = [];
  readonly waveShapers: FakeWaveShaperNode[] = [];
  readonly compressors: FakeDynamicsCompressorNode[] = [];
  readonly analysers: FakeAnalyserNode[] = [];
  readonly bufferSources: FakeAudioBufferSourceNode[] = [];

  async resume(): Promise<void> {
    this.resumeCalls += 1;
    this.state = 'running';
    this.onstatechange?.();
  }

  async close(): Promise<void> {
    this.closeCalls += 1;
    this.state = 'closed';
  }

  setState(state: AudioContextRuntimeState): void {
    this.state = state;
    this.onstatechange?.();
  }

  createGain(): GainNodePort {
    const node = new FakeGainNode();
    this.gains.push(node);
    return node;
  }

  createOscillator(): OscillatorNodePort {
    const node = new FakeOscillatorNode();
    this.oscillators.push(node);
    return node;
  }

  createBiquadFilter(): BiquadFilterNodePort {
    const node = new FakeBiquadFilterNode();
    this.filters.push(node);
    return node;
  }

  createDelay(): DelayNodePort {
    const node = new FakeDelayNode();
    this.delays.push(node);
    return node;
  }

  createWaveShaper(): WaveShaperNodePort {
    const node = new FakeWaveShaperNode();
    this.waveShapers.push(node);
    return node;
  }

  createDynamicsCompressor(): DynamicsCompressorNodePort {
    const node = new FakeDynamicsCompressorNode();
    this.compressors.push(node);
    return node;
  }

  createAnalyser(): AnalyserNodePort {
    const node = new FakeAnalyserNode();
    this.analysers.push(node);
    return node;
  }

  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBufferPort {
    return new FakeAudioBuffer(numberOfChannels, length, sampleRate);
  }

  createBufferSource(): AudioBufferSourceNodePort {
    const node = new FakeAudioBufferSourceNode();
    this.bufferSources.push(node);
    return node;
  }
}
