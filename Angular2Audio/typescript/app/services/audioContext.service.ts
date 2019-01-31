import { Injectable } from '@angular/core';

@Injectable()
export class AudioContextService {
    private audioContext: AudioContext;
    context(): AudioContext {
        return this.audioContext;
    }

    constructor() {
        this.audioContext = new AudioContext();

        window.addEventListener('keydown', ($event: KeyboardEvent) => {
            if (this.audioContext.state !== "running")
                this.audioContext.resume();
        });
    }
}