export type AudioContextRuntimeState =
  'suspended' | 'running' | 'interrupted' | 'closed';

export interface AudioParamPort {
  value: number;
  cancelScheduledValues(startTime: number): AudioParamPort;
  cancelAndHoldAtTime?(cancelTime: number): AudioParamPort;
  setValueAtTime(value: number, startTime: number): AudioParamPort;
  linearRampToValueAtTime(value: number, endTime: number): AudioParamPort;
  setTargetAtTime(
    target: number,
    startTime: number,
    timeConstant: number,
  ): AudioParamPort;
}

export interface AudioNodePort {
  connect(destination: AudioNodePort | AudioParamPort): void;
  disconnect(): void;
}

export interface GainNodePort extends AudioNodePort {
  readonly gain: AudioParamPort;
}

export interface OscillatorNodePort extends AudioNodePort {
  type: OscillatorType;
  readonly frequency: AudioParamPort;
  readonly detune: AudioParamPort;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface BiquadFilterNodePort extends AudioNodePort {
  type: BiquadFilterType;
  readonly frequency: AudioParamPort;
  readonly Q: AudioParamPort;
  readonly gain: AudioParamPort;
}

export interface DelayNodePort extends AudioNodePort {
  readonly delayTime: AudioParamPort;
}

export interface WaveShaperNodePort extends AudioNodePort {
  curve: Float32Array<ArrayBuffer> | null;
  oversample: OverSampleType;
}

export interface DynamicsCompressorNodePort extends AudioNodePort {
  readonly threshold: AudioParamPort;
  readonly knee: AudioParamPort;
  readonly ratio: AudioParamPort;
  readonly attack: AudioParamPort;
  readonly release: AudioParamPort;
}

export interface AnalyserNodePort extends AudioNodePort {
  fftSize: number;
  smoothingTimeConstant: number;
  readonly frequencyBinCount: number;
  getByteTimeDomainData(array: Uint8Array<ArrayBuffer>): void;
  getByteFrequencyData(array: Uint8Array<ArrayBuffer>): void;
}

export interface AudioBufferPort {
  readonly length: number;
  readonly sampleRate: number;
  getChannelData(channel: number): Float32Array;
}

export interface AudioBufferSourceNodePort extends AudioNodePort {
  buffer: AudioBufferPort | null;
  loop: boolean;
  start(when?: number): void;
  stop(when?: number): void;
}

export interface AudioContextPort {
  readonly destination: AudioNodePort;
  readonly sampleRate: number;
  readonly currentTime: number;
  readonly state: AudioContextRuntimeState;
  onstatechange: (() => void) | null;
  resume(): Promise<void>;
  close(): Promise<void>;
  createGain(): GainNodePort;
  createOscillator(): OscillatorNodePort;
  createBiquadFilter(): BiquadFilterNodePort;
  createDelay(maxDelayTime?: number): DelayNodePort;
  createWaveShaper(): WaveShaperNodePort;
  createDynamicsCompressor(): DynamicsCompressorNodePort;
  createAnalyser(): AnalyserNodePort;
  createBuffer(
    numberOfChannels: number,
    length: number,
    sampleRate: number,
  ): AudioBufferPort;
  createBufferSource(): AudioBufferSourceNodePort;
}

export type AudioContextFactory = () => AudioContextPort;
