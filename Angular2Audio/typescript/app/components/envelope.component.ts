import { Component, ViewChild, OnInit } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';

@Component({
    selector: 'envelope',
    template: `<h4>Envelope</h4>
<knob label="Attack" #knobAttack [min]="0" [max]="100" [value]="50" [startDegree]="200"  [endDegree]="120" (change)="updateAttack($event)"></knob>
<knob label="Release" #knobRelease [min]="0" [max]="100" [value]="50" [startDegree]="200"  [endDegree]="120" (change)="updateRelease($event)"></knob>
`
})
export class EnvelopeComponent implements IAudioNodeComponent, OnInit {
    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;
    private readonly envelope: GainNode;

    private attack = 0.5;
    private release = 0.5;

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
         this.knobAttack.setInitialValue(this.attack * 100);
         this.knobRelease.setInitialValue(this.release * 100);
    }

    node(): AudioNode {
        return this.envelope;
    }

    updateAttack(value: any) {
        this.attack = value / 100.0;
    }

    updateRelease(value: any) {
        this.release = value / 100.0;
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