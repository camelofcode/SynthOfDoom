import { Component, QueryList, ViewChildren, AfterViewInit, ChangeDetectorRef, ElementRef } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';

@Component({
    selector: 'mixer',
    template: `<h4>Mixer</h4>
<ng-template ngFor let-item [ngForOf]="inputNodes" let-currentIndex="index + 1" let-i="index">
    <knob #gainKnobs></knob>
    <knob #filterKnobs label="Filter 1/2 Mix"></knob>
    <input #switches type="checkbox" (change)="updateChannelOn($event, i)"/>
</ng-template>
`
})
export class MixerComponent implements IMultiInputAudioNodeComponent, AfterViewInit {
    private readonly minGain: number = 0;
    private readonly maxGain: number = 1;

    private readonly audioContext: AudioContext;

    private readonly outputNode1: GainNode;
    private readonly outputNode2: GainNode;
    private readonly inputNodes: Array<GainNode>;
    private readonly output1ChannelGains: Array<GainNode>;
    private readonly output2ChannelGains: Array<GainNode>;
    private readonly labels: Array<String>;

    @ViewChildren('gainKnobs') 
    gainKnobs: QueryList<KnobComponent>;

    @ViewChildren('filterKnobs')
    filterKnobs: QueryList<KnobComponent>;

    @ViewChildren('switches')
    switches: QueryList<ElementRef>;

    constructor(private changeDetector: ChangeDetectorRef, audioContextService: AudioContextService) {
        this.audioContext = audioContextService.context();

        this.inputNodes = new Array<GainNode>();
        this.output1ChannelGains = new Array<GainNode>();
        this.output2ChannelGains = new Array<GainNode>();
        this.labels = new Array<String>();

        this.outputNode1 = this.audioContext.createGain();
        this.outputNode1.gain.value = 1.0;
        this.outputNode2 = this.audioContext.createGain();
        this.outputNode2.gain.value = 1.0;
    }

    ngAfterViewInit(): void {
        for (let i = 0; i < this.inputNodes.length; i++) {
            const x = i;

            this.gainKnobs.toArray()[i].init(this.minGain, this.maxGain, this.inputNodes[i].gain.value, (value: number) => {
                this.inputNodes[x].gain.setValueAtTime(value, 0);
            });

            this.gainKnobs.toArray()[i].label = this.labels[i];

            this.filterKnobs.toArray()[i].init(this.minGain, this.maxGain, this.output2ChannelGains[i].gain.value, (value: number) => {
                this.output1ChannelGains[x].gain.setValueAtTime(1 - value, 0);
                this.output2ChannelGains[x].gain.setValueAtTime(value, 0);
            });

            this.switches.toArray()[i].nativeElement.checked = true;

            this.changeDetector.detectChanges();
        }
    }

    addChannel(node: AudioNode, label: String): void {
        const newNode = this.audioContext.createGain();
        newNode.gain.value = 0.8;
        node.connect(newNode);
        this.inputNodes.push(newNode);

        const output1ChannelGain = this.audioContext.createGain();
        const output2ChannelGain = this.audioContext.createGain();

        output1ChannelGain.gain.value = 0.5;
        output2ChannelGain.gain.value = 0.5;
        newNode.connect(output1ChannelGain);
        newNode.connect(output2ChannelGain);
        this.output1ChannelGains.push(output1ChannelGain);
        this.output2ChannelGains.push(output2ChannelGain);

        this.labels.push(label);
    }

    output1(): AudioNode {
        for (let i = 0; i < this.inputNodes.length; i++) {
            this.output1ChannelGains[i].connect(this.outputNode1);
        }

        return this.outputNode1;
    }

    output2(): AudioNode {
        for (let i = 0; i < this.inputNodes.length; i++) {
            this.output2ChannelGains[i].connect(this.outputNode2);
        }

        return this.outputNode2;
    }

    updateChannelOn(event: any, target: number) {
        if (event.target.checked) {
            this.inputNodes[target].connect(this.output1ChannelGains[target]);
            this.inputNodes[target].connect(this.output2ChannelGains[target]);
        } else {
            this.inputNodes[target].disconnect(this.output1ChannelGains[target]);
            this.inputNodes[target].disconnect(this.output2ChannelGains[target]);
        }
    }
}