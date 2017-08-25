import { Component, ViewChild, OnInit } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'envelope',
    template: `<h4>Envelope</h4>
<knob #knobAttack label="Attack" (change)="updateAttack($event)"></knob>
<knob #knobDecay label="Decay" (change)="updateDecay($event)"></knob>
<knob #knobSustain label="Sustain" (change)="updateSustain($event)"></knob>
<knob #knobRelease label="Release" (change)="updateRelease($event)"></knob>
`
})
export class EnvelopeComponent implements IAudioNodeComponent, OnInit {
    private readonly inputService: InputService;
    private readonly audioContext: AudioContext;
    private readonly envelope: GainNode;

    private attack = 0.5;
    private decay = 0.5;
    private sustain = 0.5;
    private release = 0.5;
    private readonly minAttack: number = 0;
    private readonly maxAttack: number = 2;
    private readonly minDecay: number = 0;
    private readonly maxDecay: number = 2;
    private readonly minSustain: number = 0;
    private readonly maxSustain: number = 1;
    private readonly minRelease: number = 0;
    private readonly maxRelease: number = 2;

    @ViewChild('knobAttack')
    private knobAttack: KnobComponent;

    @ViewChild('knobDecay')
    private knobDecay: KnobComponent;

    @ViewChild('knobSustain')
    private knobSustain: KnobComponent;

    @ViewChild('knobRelease')
    private knobRelease: KnobComponent;

    constructor(private audioContextService: AudioContextService, inputService: InputService) {
        this.audioContext = audioContextService.context();
        this.inputService = inputService;

        this.inputService.velocityOn$.subscribe((velocity: number) => {
            this.velocityOn(velocity);
        });

        this.inputService.velocityOff$.subscribe(() => {
            this.velocityOff();
        });

        this.envelope = this.audioContext.createGain();
        this.envelope.gain.value = 0.0;
    }

    ngOnInit(): void {
        this.knobAttack.setInitialValue(Utilities.scaleToPercent(this.attack, this.minAttack, this.maxAttack));
        this.knobDecay.setInitialValue(Utilities.scaleToPercent(this.decay, this.minDecay, this.maxDecay));
        this.knobSustain.setInitialValue(Utilities.scaleToPercent(this.sustain, this.minSustain, this.maxSustain));
        this.knobRelease.setInitialValue(Utilities.scaleToPercent(this.release, this.minRelease, this.maxRelease));
    }

    node(): AudioNode {
        return this.envelope;
    }

    updateAttack(value: number) {
        this.attack = Utilities.scaleFromPercent(value, this.minAttack, this.maxAttack);
    }

    updateDecay(value: number) {
        this.decay = Utilities.scaleFromPercent(value, this.minDecay, this.maxDecay);
    }

    updateSustain(value: number) {
        this.sustain = Utilities.scaleFromPercent(value, this.minSustain, this.maxSustain);
    }

    updateRelease(value: number) {
        this.release = Utilities.scaleFromPercent(value, this.minRelease, this.maxRelease);
    }

    private velocityToGain = (velocity: number) => {
        return velocity / 127.0;
    }

    private velocityOn = (velocity: number) => {
        const time = this.audioContext.currentTime;

        this.envelope.gain.cancelScheduledValues(0);

        this.envelope.gain.setValueAtTime(0, 0);
        this.envelope.gain.linearRampToValueAtTime(this.velocityToGain(velocity), time + this.attack);
        this.envelope.gain.linearRampToValueAtTime(this.velocityToGain(velocity) * this.sustain, time + this.attack + this.decay);

    }

    private velocityOff = () => {
        const time = this.audioContext.currentTime;

        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.linearRampToValueAtTime(0.0, time + this.release);
    }
}