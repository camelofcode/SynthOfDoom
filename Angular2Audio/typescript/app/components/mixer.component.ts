import { Component, QueryList, ViewChildren, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'mixer',
    template: `<h4>Mixer</h4>
<ng-template ngFor let-item [ngForOf]="inputNodes" let-currentIndex="index + 1" let-i="index">
    <knob (change)="updateChannelGain($event, i)"></knob>
    <input #switches type="checkbox" (change)="updateChannelOn($event, i)"/>
</ng-template>
`
})
export class MixerComponent implements IMultiInputAudioNodeComponent, AfterViewInit {
    private readonly minGain: number = 0;
    private readonly maxGain: number = 1;

    private readonly audioContext: AudioContextService;

    private readonly outputNode: GainNode;
    private readonly inputNodes: Array<GainNode>;
    private readonly labels: Array<String>;

    @ViewChildren(KnobComponent) 
    gainKnobs: QueryList<KnobComponent>;

    @ViewChildren('switches')
    switches: QueryList<ElementRef>;

    constructor(private changeDetector: ChangeDetectorRef, audioContext: AudioContextService) {
        this.audioContext = audioContext;

        this.inputNodes = new Array<GainNode>();
        this.labels = new Array<String>();

        this.outputNode = this.audioContext.context().createGain();
        this.outputNode.gain.value = 1.0;
    }

    ngAfterViewInit(): void {
        for (let i = 0; i < this.inputNodes.length; i++) {
            this.gainKnobs.toArray()[i].setInitialValue(Utilities.scaleToPercent(this.inputNodes[i].gain.value, this.minGain, this.maxGain));
            this.gainKnobs.toArray()[i].label = this.labels[i];

            this.switches.toArray()[i].nativeElement.checked = true;

            this.changeDetector.detectChanges();
        }
    }

    addChannel(node: AudioNode, label: String): void {
        const newNode = this.audioContext.context().createGain();
        newNode.gain.value = 0.8;
        node.connect(newNode);
        this.inputNodes.push(newNode);
        this.labels.push(label);
    }

    output(): AudioNode {
        for (let i = 0; i < this.inputNodes.length; i++) {
            this.inputNodes[i].connect(this.outputNode);
        }

        return this.outputNode;
    }

    updateChannelGain(value: number, target: number) {
        this.inputNodes[target].gain.setValueAtTime(Utilities.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    }

    updateChannelOn(event: any, target: number) {
        if (event.target.checked) {
            this.inputNodes[target].connect(this.outputNode);
        } else {
            this.inputNodes[target].disconnect(this.outputNode);
        }
    }
}