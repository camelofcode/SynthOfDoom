import { Component } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'mixer',
    template: `<p>Yo dawg this is a mixer component</p>`
})
export class MixerComponent implements IMultiInputAudioNodeComponent {
    private readonly audioContext: AudioContextService;

    private readonly numberOfInputs = 4;

    private readonly outputNode: GainNode;
    private readonly inputNodes: Array<GainNode>;

    constructor(audioContext: AudioContextService) {
        this.audioContext = audioContext;

        this.inputNodes = new Array<GainNode>(this.numberOfInputs);

        this.outputNode = this.audioContext.context().createGain();
        this.outputNode.gain.value = 1.0;

        //TODO: make this settable. Doesn't need it for the synth, but will make it easier to reuse as a real mixer

        for (let i = 0; i < this.numberOfInputs; i++) {
            const newNode = this.audioContext.context().createGain();
            newNode.gain.value = 0.5;
            this.inputNodes[i] = newNode;
        }
    }

    inputs(): AudioNode[] {
        return this.inputNodes;
    }

    output(): AudioNode {
        for (let i = 0; i < this.numberOfInputs; i++) {
            this.inputNodes[i].connect(this.outputNode);
        }

        return this.outputNode;
    }
}