import { Component, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'mixer',
    template: `<h4>Mixer</h4>
<ng-template ngFor let-item [ngForOf]="inputNodes" let-currentIndex="index + 1" let-i="index">
    <knob label="Oscillator {{currentIndex}}" (change)="updateOscillator($event, i)"></knob>
</ng-template>
`
})
export class MixerComponent implements IMultiInputAudioNodeComponent, AfterViewInit {


    private readonly minGain: number = 0;
    private readonly maxGain: number = 1;

    private readonly audioContext: AudioContextService;

    //TODO: make this settable. Doesn't need it for the synth, but will make it easier to reuse as a real mixer
    private readonly numberOfInputs = 3;

    private readonly outputNode: GainNode;
    private readonly inputNodes: Array<GainNode>;

    @ViewChildren(KnobComponent) 
    gainKnobs: QueryList<KnobComponent>;

    constructor(audioContext: AudioContextService) {
        this.audioContext = audioContext;

        this.inputNodes = new Array<GainNode>(this.numberOfInputs);

        this.outputNode = this.audioContext.context().createGain();
        this.outputNode.gain.value = 1.0;

        for (let i = 0; i < this.numberOfInputs; i++) {
            const newNode = this.audioContext.context().createGain();
            newNode.gain.value = 0.8;
            this.inputNodes[i] = newNode;
        }
    }

    ngAfterViewInit(): void {
        for (let i = 0; i < this.numberOfInputs; i++) {
            this.gainKnobs.toArray()[i].setInitialValue(Utilities.scaleToPercent(this.inputNodes[i].gain.value, this.minGain, this.maxGain));
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

    updateOscillator(value: number, target: number) {
        this.inputNodes[target].gain.setValueAtTime(Utilities.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    }
}