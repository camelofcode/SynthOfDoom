import { Component } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'envelope',
    template: `<p>Yo dawg this is an envelope component</p>`
})
export class EnvelopeComponent implements IAudioNodeComponent {
    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;
    private readonly envelope: GainNode;

    private attack = 0.5;
    private release = 0.5;

    constructor(audioContext: AudioContextService, inputService: InputService) {
        this.audioContext = audioContext;
        this.inputService = inputService;

        this.inputService.velocityOn$.subscribe((velocity: number) => {
            this.velocityOn(velocity);
        });

        this.inputService.velocityOff$.subscribe(() => {
            this.velocityOff();
        });

        this.envelope = this.audioContext.context().createGain();
        this.envelope.gain.value = 0.0;
    }

    node(): AudioNode {
        return this.envelope;
    }

    private velocityToGain = (velocity: number) => {
        return velocity / 127.0;
    }

    private velocityOn = (velocity: number) => {
        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.setTargetAtTime(this.velocityToGain(velocity), 0, this.attack);
    }

    private velocityOff = () => {
        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
    }
}