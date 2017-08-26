import { Component, ViewChild, OnInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import { FxComponent } from './fx.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'delay',
    template: `<h4>Delay</h4>
<knob #knobTime label="Time" (change)="updateTime($event)"></knob>
<knob #knobFeedback label="Feedback" (change)="updateFeedback($event)"></knob>
<knob #knobFilter label="Filter" (change)="updateFilter($event)"></knob>
<knob #knobMix label="Mix" (change)="updateMix($event)"></knob>
`
})
export class DelayFxComponent extends FxComponent implements OnInit {
    audioNode: DelayNode;
    feedback: GainNode;
    filter: BiquadFilterNode;

    private readonly minDelay: number = 0.01;
    private readonly maxDelay: number = 2.0;
    private readonly minFilter: number = 200;
    private readonly maxFilter: number = 5000;

    @ViewChild('knobMix')
    private knobMix: KnobComponent;

    @ViewChild('knobFeedback')
    private knobFeedback: KnobComponent;

    @ViewChild('knobTime')
    private knobTime: KnobComponent;

    @ViewChild('knobFilter')
    private knobFilter: KnobComponent;

    constructor(audioContextService: AudioContextService) {
        super(audioContextService);
        this.audioNode = this.context.createDelay(this.maxDelay);
        this.feedback = this.context.createGain();
        this.filter = this.context.createBiquadFilter();

        this.audioNode.delayTime.setValueAtTime(0.5, 0);
        this.feedback.gain.setValueAtTime(0.5, 0);

        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(1000, 0);

        this.audioNode.connect(this.feedback);
        this.feedback.connect(this.filter);
        this.filter.connect(this.audioNode);
    }

    ngOnInit(): void {
        this.knobMix.setInitialValue(Utilities.scaleToPercent(0.5, 0, 1));
        this.knobTime.setInitialValue(Utilities.scaleToPercent(0.5, this.minDelay, this.maxDelay));
        this.knobFeedback.setInitialValue(Utilities.scaleToPercent(0.5, 0, 1));
        this.knobFilter.setInitialValue(Utilities.scaleToPercent(1000, this.minFilter, this.maxFilter));
    }

    updateTime(value: number) {
        this.audioNode.delayTime.cancelScheduledValues(0);
        this.audioNode.delayTime.setTargetAtTime(Utilities.scaleFromPercent(value, this.minDelay, this.maxDelay), this.context.currentTime, 0.1);
    }

    updateFeedback(value: number) {
        this.feedback.gain.setValueAtTime(Utilities.scaleFromPercent(value, 0, 1), 0);
    }

    updateFilter(value: number) {
        this.filter.frequency.setValueAtTime(Utilities.scaleFromPercent(value, this.minFilter, this.maxFilter), 0);
    }
}