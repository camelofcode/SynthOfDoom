import { Component, ViewChild, OnInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'biquad-filter',
    template: `<h4>Filter</h4>
<knob #knobFrequency label="Cut Off" (change)="updateFrequency($event)"></knob>
<knob #knobQ label="Resonance" (change)="updateQ($event)"></knob>
`
})
export class BiquadFilterComponent implements IAudioNodeComponent, OnInit {
    private readonly audioContext: AudioContextService;
    private readonly filter: BiquadFilterNode;

    private readonly minFrequency: number = 30;
    private readonly maxFrequency: number = 5000;
    private readonly minQ: number = 1;
    private readonly maxQ: number = 16;

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
        this.knobFrequency.setInitialValue(Utilities.scaleToPercent(this.filter.frequency.value, this.minFrequency, this.maxFrequency));
        this.knobQ.setInitialValue(Utilities.scaleToPercent(this.filter.Q.value, this.minQ, this.maxQ));
    }

    node(): AudioNode {
        return this.filter;
    }

    updateFrequency(value: number) {
        this.filter.frequency.setValueAtTime(Utilities.scaleFromPercent(value, this.minFrequency, this.maxFrequency), 0);
    }

    updateQ(value: number) {
        this.filter.Q.setValueAtTime(Utilities.scaleFromPercent(value, this.minQ, this.maxQ), 0);
    }
}