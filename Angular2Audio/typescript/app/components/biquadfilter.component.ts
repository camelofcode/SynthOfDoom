import { Component, ViewChild, AfterViewChecked, Input } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { InputService } from '../services/input.service';
import { LfoTargetService } from '../services/lfoTarget.service';
import { KnobComponent } from './ui/knob.component';
import { LfoTarget } from '../models/lfoTarget';

@Component({
    selector: 'biquad-filter',
    template: `<h4>{{name}}</h4>
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
<knob #knobFrequency label="Cut Off"  unit="Hz"></knob>
<knob #knobQ label="Resonance" [class.hide]="!showQ"  unit=""></knob>
<knob #knobGain label="Gain" [class.hide]="!showGain"  unit=""></knob>
<knob #knobDepth label="Env. Depth"  unit=""></knob>
<knob #knobAttack label="Env. Attack"  unit="s"></knob>
<knob #knobDecay label="Env. Decay"  unit="s"></knob>
<knob #knobSustain label="Env. Sustain"  unit="s"></knob>
<knob #knobRelease label="Env. Release"  unit="s"></knob>
`
})
export class BiquadFilterComponent implements IAudioNodeComponent, AfterViewChecked {
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

    @Input('name')
    name: String = 'Oscillator';

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

    ngAfterViewChecked(): void {
        this.knobFrequency.init(this.name, this.minFrequency, this.maxFrequency, this.filter.frequency.value, (value: number) => {
            this.frequency = value;
            this.filter.frequency.setValueAtTime(this.frequency, 0);
        });

        this.knobQ.init(this.name, this.minQ, this.maxQ, this.filter.Q.value, (value: number) => {
            this.filter.Q.setValueAtTime(value, 0);
        });

        this.knobDepth.init(this.name, this.minDepth, this.maxDepth, this.depth, (value: number) => {
            this.depth = value;
        });

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
        return this.filter;
    }

    registerTargets(componentName: string): void {
        const id = componentName.toLowerCase().replace(' ', '') + 'Cutoff';
        const name = componentName + ' Cutoff';

        this.lfoTargetService.registerTarget(new LfoTarget(id, name, 20, 5000, this.filter.frequency));
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
                    this.knobGain.init(this.name, this.minGain, this.maxGain, this.filter.gain.value, (value: number) => {
                        this.filter.gain.setValueAtTime(value, 0);
                    });
                    return;
                }
            case 'lowshelf':
            case 'highshelf':
                {
                    this.showGain = true;
                    this.showQ = false;
                    this.filter.Q.setValueAtTime(2, 0);
                    this.knobQ.init(this.name, this.minGain, this.maxGain, this.filter.gain.value, (value: number) => {
                        this.filter.gain.setValueAtTime(value, 0);
                    });
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
            attackTarget = this.scaleFromPercent(depthPercent, this.frequency, this.maxFrequency);
            decayTarget = this.scaleFromPercent(depthPercent * this.sustain, this.frequency, this.maxFrequency);
        } else {
            attackTarget = this.scaleFromPercent(depthPercent, this.frequency, this.minFrequency);
            decayTarget = this.scaleFromPercent(depthPercent * this.sustain, this.frequency, this.minFrequency);
        }

        this.filter.frequency.linearRampToValueAtTime(attackTarget, time + this.attack);
        this.filter.frequency.linearRampToValueAtTime(decayTarget, time + this.attack + this.decay);
    }

    private velocityOff = () => {
        const time = this.audioContext.currentTime;

        this.filter.frequency.cancelScheduledValues(0);
        this.filter.frequency.linearRampToValueAtTime(this.frequency, time + this.release);
    }

    private scaleFromPercent(value: number, lower: number, upper: number) {
        return ((upper - lower) * (value / 100.0)) + lower;
    }
}