import { Component } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'biquad-filter',
    template: `<p>Yo dawg this is a biquad filter component</p>
<label>Cutoff</label>
<input type="range" min="50" max="2000" step="1" #frequencyRange (input)="updateFrequency(frequencyRange.value)"/>
<label>Resonance</label>
<input type="range" min="0.1" max="32" step="0.1" #qRange (input)="updateQ(qRange.value)"/>
`
})
export class BiquadFilterComponent implements IAudioNodeComponent {

    node(): AudioNode {
        return this.filter;
    }

    private readonly audioContext: AudioContextService;

    private filter: BiquadFilterNode;

    constructor(audioContext: AudioContextService) {
        this.audioContext = audioContext;

        this.filter = this.audioContext.context().createBiquadFilter();
    }

    updateFrequency(value: number) {
        this.filter.frequency.setValueAtTime(value, 0);
    }

    updateQ(value: number) {
        this.filter.Q.setValueAtTime(value, 0);
    }
}