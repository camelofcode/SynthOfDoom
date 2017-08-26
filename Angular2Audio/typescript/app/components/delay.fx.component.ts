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
<knob #knobMix label="Mix" (change)="updateMix($event)"></knob>
`
})
export class DelayFxComponent extends FxComponent implements OnInit {
    audioNode: DelayNode;
    feedback: GainNode;

    private readonly minDelay: number = 0.01;
    private readonly maxDelay: number = 2.0;

    @ViewChild('knobMix')
    private knobMix: KnobComponent;

    @ViewChild('knobFeedback')
    private knobFeedback: KnobComponent;

    @ViewChild('knobTime')
    private knobTime: KnobComponent;

    constructor(audioContextService: AudioContextService) {
        super(audioContextService);
        this.audioNode = this.context.createDelay(this.maxDelay);
        this.feedback = this.context.createGain();
        this.audioNode.delayTime.setValueAtTime(0.5, 0);
        this.feedback.gain.setValueAtTime(0.5, 0);

        this.audioNode.connect(this.feedback);
        this.feedback.connect(this.audioNode);
    }

    ngOnInit(): void {
        this.knobMix.setInitialValue(Utilities.scaleToPercent(0.5, 0, 1));
        this.knobTime.setInitialValue(Utilities.scaleToPercent(0.5, this.minDelay, this.maxDelay));
        this.knobFeedback.setInitialValue(Utilities.scaleToPercent(0.5, 0, 1));
    }

    updateTime(value: number) {
        this.audioNode.delayTime.cancelScheduledValues(0);
        this.audioNode.delayTime.setTargetAtTime(Utilities.scaleFromPercent(value, this.minDelay, this.maxDelay), this.context.currentTime, 0.1);
    }

    updateFeedback(value: number) {
        this.feedback.gain.setValueAtTime(Utilities.scaleFromPercent(value, 0, 1), 0);
    }
}