import { Component, ViewChild, OnInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { InputService } from '../services/input.service';
import { LfoTargetService } from '../services/lfoTarget.service';
import { KnobComponent } from './ui/knob.component';
import { LfoTarget } from '../models/lfoTarget';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'biquad-filter',
    template: `<h4>Filter</h4>
<div><label>Type</label><br/>
    <select (change)="updateType($event.target.value)">
        <option value="lowpass" selected>Low Pass</option>
        <option value="highpass">High Pass</option>    
        <option value="bandpass">Band Pass</option>
        <option value="lowshelf">Low Shelf</option>
        <option value="highshelf">High Shelf</option>
        <option value="peaking">Peaking</option>
        <option value="notch">Notch</option>
        <option value="allpass">All Pass</option>
    </select>
</div>
<knob #knobFrequency label="Cut Off" (change)="updateFrequency($event)"></knob>
<knob #knobQ label="Resonance" (change)="updateQ($event)" [class.hide]="!showQ"></knob>
<knob #knobGain label="Gain" (change)="updateGain($event)" [class.hide]="!showGain"></knob>
<knob #knobDepth label="Env. Depth" (change)="updateDepth($event)"></knob>
<knob #knobAttack label="Env. Attack" (change)="updateAttack($event)"></knob>
<knob #knobDecay label="Env. Decay" (change)="updateDecay($event)"></knob>
<knob #knobSustain label="Env. Sustain" (change)="updateSustain($event)"></knob>
<knob #knobRelease label="Env. Release" (change)="updateRelease($event)"></knob>
`
})
export class BiquadFilterComponent implements IAudioNodeComponent, OnInit {
    private readonly audioContext: AudioContext;
    private readonly inputService: InputService;
    private readonly lfoTargetService: LfoTargetService;
    private readonly filter: BiquadFilterNode;

    showQ = true;
    showGain = false;

    private frequency = 1000;
    private depth = 0.0;
    private attack = 0.5;
    private decay = 0.5;
    private sustain = 0.5;
    private release = 0.5;

    private readonly minFrequency: number = 60;
    private readonly maxFrequency: number = 10000;
    private readonly minQ: number = 1;
    private readonly maxQ: number = 16;
    private readonly minGain: number = -24;
    private readonly maxGain: number = 24;
    private readonly minDepth: number = -1;
    private readonly maxDepth: number = 1;
    private readonly minAttack: number = 0;
    private readonly maxAttack: number = 2;
    private readonly minDecay: number = 0;
    private readonly maxDecay: number = 2;
    private readonly minSustain: number = 0;
    private readonly maxSustain: number = 1;
    private readonly minRelease: number = 0;
    private readonly maxRelease: number = 2;

    @ViewChild('knobFrequency')
    private knobFrequency: KnobComponent;

    @ViewChild('knobQ')
    private knobQ: KnobComponent;

    @ViewChild('knobGain')
    private knobGain: KnobComponent;

    @ViewChild('knobDepth')
    private knobDepth: KnobComponent;

    @ViewChild('knobAttack')
    private knobAttack: KnobComponent;

    @ViewChild('knobDecay')
    private knobDecay: KnobComponent;

    @ViewChild('knobSustain')
    private knobSustain: KnobComponent;

    @ViewChild('knobRelease')
    private knobRelease: KnobComponent;

    constructor(audioContextService: AudioContextService, inputService: InputService, lfoTargetService: LfoTargetService) {
        this.audioContext = audioContextService.context();
        this.inputService = inputService;
        this.lfoTargetService = lfoTargetService;

        this.inputService.velocityOn$.subscribe((velocity: number) => {
            this.velocityOn();
        });

        this.inputService.velocityOff$.subscribe(() => {
            this.velocityOff();
        });

        this.filter = this.audioContext.createBiquadFilter();
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 2;
    }

    ngOnInit(): void {
        this.knobFrequency.setInitialValue(Utilities.scaleToPercent(this.filter.frequency.value, this.minFrequency, this.maxFrequency));
        this.knobQ.setInitialValue(Utilities.scaleToPercent(this.filter.Q.value, this.minQ, this.maxQ));
        this.knobDepth.setInitialValue(Utilities.scaleToPercent(this.depth, this.minDepth, this.maxDepth));
        this.knobAttack.setInitialValue(Utilities.scaleToPercent(this.attack, this.minAttack, this.maxAttack));
        this.knobDecay.setInitialValue(Utilities.scaleToPercent(this.decay, this.minDecay, this.maxDecay));
        this.knobSustain.setInitialValue(Utilities.scaleToPercent(this.sustain, this.minSustain, this.maxSustain));
        this.knobRelease.setInitialValue(Utilities.scaleToPercent(this.release, this.minRelease, this.maxRelease));
    }

    node(): AudioNode {
        return this.filter;
    }

    registerTargets(): void {
         this.lfoTargetService.registerTarget(new LfoTarget('filterCutoff', 'Filter Cutoff', 20, 5000, this.filter.frequency));
    }

    updateFrequency(value: number) {
        this.frequency = Utilities.scaleFromPercent(value, this.minFrequency, this.maxFrequency);
        this.filter.frequency.setValueAtTime(this.frequency, 0);
    }

    updateQ(value: number) {
        this.filter.Q.setValueAtTime(Utilities.scaleFromPercent(value, this.minQ, this.maxQ), 0);
    }

    updateGain(value: number) {
        this.filter.gain.setValueAtTime(Utilities.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    }

    updateDepth(value: number) {
        this.depth = Utilities.scaleFromPercent(value, this.minDepth, this.maxDepth);
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

    updateType(type: BiquadFilterType) {
        this.filter.type = type;

        switch (type) {
            case 'lowpass':
            case 'highpass':
            case 'bandpass':
            case 'notch':
            case 'allpass':
                {
                    this.showGain = false;
                    this.showQ = true;
                    this.filter.gain.setValueAtTime(0, 0);
                    this.knobGain.setInitialValue(Utilities.scaleToPercent(this.filter.gain.value, this.minGain, this.maxGain));
                    return;
                }
            case 'lowshelf':
            case 'highshelf':
                {


                    this.showGain = true;
                    this.showQ = false;
                    this.filter.Q.setValueAtTime(2, 0);
                    this.knobQ.setInitialValue(Utilities.scaleToPercent(this.filter.Q.value, this.minQ, this.maxQ));
                    return;
                }
            case 'peaking':
            {
                this.showGain = true;
                this.showQ = true;
                return;
            }
        }
    }

    private velocityToGain = (velocity: number) => {
        return velocity / 127.0;
    }

    private velocityOn = () => {
        const time = this.audioContext.currentTime;

        this.filter.frequency.cancelScheduledValues(0);
        this.filter.frequency.setValueAtTime(this.frequency, 0);

        var depthPercent = Math.abs(this.depth) * 100;
        var attackTarget: number;
        var decayTarget: number;

        if (this.depth === 0) {
            return;
        } else if (this.depth > 0) {
            attackTarget = Utilities.scaleFromPercent(depthPercent, this.frequency, this.maxFrequency);
            decayTarget = Utilities.scaleFromPercent(depthPercent * this.sustain, this.frequency, this.maxFrequency);
        } else {
            attackTarget = Utilities.scaleFromPercent(depthPercent, this.frequency, this.minFrequency);
            decayTarget = Utilities.scaleFromPercent(depthPercent * this.sustain, this.frequency, this.minFrequency);
        }

        this.filter.frequency.linearRampToValueAtTime(attackTarget, time + this.attack);
        this.filter.frequency.linearRampToValueAtTime(decayTarget, time + this.attack + this.decay);
    }

    private velocityOff = () => {
        const time = this.audioContext.currentTime;

        this.filter.frequency.cancelScheduledValues(0);
        this.filter.frequency.linearRampToValueAtTime(this.frequency, time + this.release);
    }
}