import { Component, ViewChild, OnInit } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'envelope',
    template: `<h4>Envelope</h4>
<knob #knobAttack label="Attack" (change)="updateAttack($event)"></knob>
<knob #knobRelease label="Release" (change)="updateRelease($event)"></knob>
`
})
export class EnvelopeComponent implements IAudioNodeComponent, OnInit {
    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;
    private readonly envelope: GainNode;

    private attack = 0.5;
    private release = 0.5;
    private readonly minAttack: number = 0;
    private readonly maxAttack: number = 1;
    private readonly minRelease: number = 0;
    private readonly maxRelease: number = 1;

    @ViewChild('knobAttack')
    private knobAttack: KnobComponent;

    @ViewChild('knobRelease')
    private knobRelease: KnobComponent;

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

    ngOnInit(): void {
        this.knobAttack.setInitialValue(Utilities.scaleToPercent(this.attack, this.minAttack, this.maxAttack));
        this.knobRelease.setInitialValue(Utilities.scaleToPercent(this.release, this.minRelease, this.maxRelease));
    }

    node(): AudioNode {
        return this.envelope;
    }

    updateAttack(value: number) {
        this.attack = Utilities.scaleFromPercent(value, this.minAttack, this.maxAttack);
    }

    updateRelease(value: number) {
        this.release = Utilities.scaleFromPercent(value, this.minRelease, this.maxRelease);
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