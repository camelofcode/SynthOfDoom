import { Component, ViewChild, OnInit } from '@angular/core';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import { FxComponent } from './fx.component';
import { ControlChangeService } from '../services/controlChange.service';

@Component({
    selector: 'delay',
    template: `<h4>Delay</h4>
<knob #knobTime label="Time"></knob>
<knob #knobFeedback label="Feedback"></knob>
<knob #knobFilter label="Filter"></knob>
<knob #knobMix label="Mix"></knob>
<input #switchOn type="checkbox" (change)="updateOn($event)"/>
`
})
export class DelayFxComponent extends FxComponent implements OnInit {
    delay: DelayNode;
    feedback: GainNode;
    filter: BiquadFilterNode;
    saturation: ScriptProcessorNode;
    makeup: GainNode;

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
        this.delay = this.context.createDelay(this.maxDelay);
        this.feedback = this.context.createGain();
        this.filter = this.context.createBiquadFilter();
        this.saturation = this.context.createScriptProcessor();
        this.makeup = this.context.createGain();

        this.delay.delayTime.setValueAtTime(0.5, 0);
        this.feedback.gain.setValueAtTime(0.5, 0);
        this.makeup.gain.setValueAtTime(2.0, 0);

        this.filter.type = 'lowpass';
        this.filter.frequency.setValueAtTime(1000, 0);

        this.saturation.onaudioprocess = (event: AudioProcessingEvent) => {
            var inputL = event.inputBuffer.getChannelData(0);
            var inputR = event.inputBuffer.getChannelData(1);
            var outputL = event.outputBuffer.getChannelData(0);
            var outputR = event.outputBuffer.getChannelData(1);

            var driveKnob = 0.0;
            var preSatL: number;
            var preSatR: number;

            for (let i = 0; i <  inputL.length; i++) {
                preSatL = inputL[i] * ((driveKnob + 0.1) * 1.2);
                preSatR = inputR[i] * ((driveKnob + 0.1) * 1.2);

                //http://tap-plugins.sourceforge.net/ladspa/sigmoid.html
                outputL[i] = (2 / (1 + (Math.pow(Math.E, (-5 * preSatL)))) - 1) * 0.5;
                outputR[i] = (2 / (1 + (Math.pow(Math.E, (-5 * preSatR)))) - 1) * 0.5;
            }
        }

        this.delay.connect(this.feedback);
        this.feedback.connect(this.filter);
        this.filter.connect(this.delay);
        this.delay.connect(this.saturation);
        this.saturation.connect(this.makeup);
        this.connectFxChain(this.delay, this.makeup);
    }

    ngOnInit(): void {
        this.knobMix.init(0, 1, 0.5, (value: number) => {
            this.updateMix(value);
        });

        this.knobTime.init(this.minDelay, this.maxDelay, 0.5, (value: number) => {
            this.delay.delayTime.cancelScheduledValues(0);
            this.delay.delayTime.setTargetAtTime(value, this.context.currentTime, 0.1);
        });

        this.knobFeedback.init(0, 1, 0.5, (value: number) => {
            this.feedback.gain.setValueAtTime(value, 0);
        });

        this.knobFilter.init(this.minFilter, this.maxFilter, 1000, (value: number) => {
            this.filter.frequency.setValueAtTime(value, 0);
        });
    }
}