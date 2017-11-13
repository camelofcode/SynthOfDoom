import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { LfoTargetService } from '../services/lfoTarget.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import { LfoTarget } from '../models/lfoTarget';
import { LfoConnectionRequest } from '../models/lfoConnectionRequest';
import { LfoConnectionResponse } from '../models/lfoConnectionResponse';

@Component({
    selector: 'lfo',
    template: `<h4>{{name}}</h4>
<div><label>Waveform</label><br/>
    <select (change)="updateType($event.target.value)">
        <option value="sine" selected>Sine</option>
        <option value="sawtooth">Sawtooth</option>    
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
    </select>
</div>
<br/>
<div><label>Target</label><br/>
    <select (change)="updateTarget($event.target.value)">
        <option *ngFor="let target of targets" value="{{target.id}}">{{target.displayName}}</option>  
    </select>
</div>
<br/>
<div>
    <knob #knobFrequency label="Rate"></knob>
    <knob #knobAmplitude label="Depth"></knob>
</div>
`
})
export class LfoComponent implements OnInit {
    private readonly audioContext: AudioContext;
    private readonly lfoTargetService: LfoTargetService;
    private readonly lfo: OscillatorNode;
    private readonly gain: GainNode;
    private targets: Array<LfoTarget> = new Array<LfoTarget>();

    @Input('name')
    name: String = 'LFO';

    private readonly minFrequency: number = 0.1;
    private readonly maxFrequency: number = 20.1;
    private minAmplitude: number = 0;
    private maxAmplitude: number = 1;
    private currentTarget: string = null;

    @ViewChild('knobFrequency')
    private knobFrequency: KnobComponent;

    @ViewChild('knobAmplitude')
    private knobAmplitude: KnobComponent;

    constructor(audioContextService: AudioContextService, lfoTargetService: LfoTargetService) {
        this.audioContext = audioContextService.context();
        this.lfoTargetService = lfoTargetService;

        this.lfo = this.audioContext.createOscillator();
        this.lfo.frequency.value = 1;
        this.lfo.type = 'sine';
        this.lfo.start();

        this.gain = this.audioContext.createGain();
        this.gain.gain.value = 0.5;

        this.lfo.connect(this.gain);
    }

    ngOnInit(): void {
        this.knobFrequency.init(this.minFrequency, this.maxFrequency, this.lfo.frequency.value, (value: number) => {
            this.lfo.frequency.setValueAtTime(value, 0);
        });

        this.knobAmplitude.init(this.minAmplitude, this.maxAmplitude, 0.5, (value: number) => {
            this.gain.gain.setValueAtTime(value, 0);
        });
    }

    loadTargets(): void {
        this.targets = new Array<LfoTarget>();
        this.targets.push(new LfoTarget('', 'None', 0, 0, null));

        const targets = this.lfoTargetService.getTargets();
        for (let i = 0; i < targets.length; i++) {
            this.targets.push(targets[i]);
        }
    }

    updateType(type: OscillatorType) {
        this.lfo.type = type;
    }

    updateTarget(targetId: string) {
        if (this.currentTarget) {
            this.lfoTargetService.disconnectTarget(new LfoConnectionRequest(this.currentTarget, this.gain));
        }

        if (targetId && targetId !== '') {
            const response = this.lfoTargetService.connectTarget(new LfoConnectionRequest(targetId, this.gain));

            this.minAmplitude = response.minAmplitude;
            this.maxAmplitude = response.maxAmplitude;
            this.currentTarget = targetId;
        } else {
            this.minAmplitude = 0;
            this.maxAmplitude = 1;
            this.currentTarget = null;
        }

        this.gain.gain.value = 0.5;
        this.knobAmplitude.init(this.minAmplitude, this.maxAmplitude, 0.5, (value: number) => {
            this.gain.gain.setValueAtTime(value, 0);
        });
    }
}