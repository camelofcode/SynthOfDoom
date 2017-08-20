import { Component, ViewChild, OnInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';

@Component({
    selector: 'biquad-filter',
    template: `<h4>Filter</h4>
<knob label="Cut Off" #knobFrequency [min]="50" [max]="2000" [value]="1000" [startDegree]="200"  [endDegree]="120" (change)="updateFrequency($event)"></knob>
<knob label="Resonance" #knobQ [min]="1" [max]="32" [value]="2" [startDegree]="200"  [endDegree]="120" (change)="updateQ($event)"></knob>
`
})
export class BiquadFilterComponent implements IAudioNodeComponent, OnInit {


    private readonly audioContext: AudioContextService;
    private readonly filter: BiquadFilterNode;

    @ViewChild('knobFrequency')
    private knobFrequency: KnobComponent;

    @ViewChild('knobQ')
    private knobQ: KnobComponent;

    constructor(audioContext: AudioContextService) {
        this.audioContext = audioContext;

        this.filter = this.audioContext.context().createBiquadFilter();
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 2;
    }

    ngOnInit(): void {
        this.knobFrequency.setInitialValue(this.filter.frequency.value);
        this.knobQ.setInitialValue(this.filter.Q.value);
    }

    node(): AudioNode {
        return this.filter;
    }

    updateFrequency(value: any) {
        this.filter.frequency.setValueAtTime(value, 0);
    }

    updateQ(value: number) {
        this.filter.Q.setValueAtTime(value, 0);
    }
}