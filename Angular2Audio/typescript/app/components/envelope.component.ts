import { Component, ViewChild, AfterViewChecked } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';

@Component({
    selector: 'envelope',
    template: `<h4>Envelope</h4>
<knob #knobAttack label="Attack" unit="s"></knob>
<knob #knobDecay label="Decay" unit="s"></knob>
<knob #knobSustain label="Sustain" unit="s"></knob>
<knob #knobRelease label="Release" unit="s"></knob>
`
})
export class EnvelopeComponent implements IAudioNodeComponent, AfterViewChecked {
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

    private name: String = "Envelope";

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

    ngAfterViewChecked(): void {
        this.knobAttack.init(this.name, this.minAttack, this.maxAttack, this.attack, (value: number) => {
            this.attack = value;
        });

        this.knobDecay.init(this.name, this.minDecay, this.maxDecay, this.decay, (value: number) => {
            this.decay = value;
        });

        this.knobSustain.init(this.name, this.minSustain, this.maxSustain, this.sustain, (value: number) => {
            this.sustain = value;
        });

        this.knobRelease.init(this.name, this.minRelease, this.maxRelease, this.release, (value: number) => {
            this.sustain = value;
        });
    }

    node(): AudioNode {
        return this.envelope;
    }

    registerTargets(): void {
        return;
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