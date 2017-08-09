import { Injectable } from '@angular/core';

@Injectable()
export class AudioContextService {
    private audioContext: AudioContext;
    context(): AudioContext {
        return this.audioContext;
    }

    constructor() {
        this.audioContext = new AudioContext();
    }
}