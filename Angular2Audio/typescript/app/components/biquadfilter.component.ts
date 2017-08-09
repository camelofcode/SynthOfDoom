import { Component } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'biquad-filter',
    template: `<p>Yo dawg this is a biquad filter component</p>`
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
}