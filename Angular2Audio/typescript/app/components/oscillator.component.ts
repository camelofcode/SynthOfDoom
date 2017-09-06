import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';
import { KnobComponent } from './ui/knob.component';
import Utilities from '../supporting/utilities';

@Component({
    selector: 'oscillator',
    template: `<h4>{{name}}</h4>
<div><label>Waveform</label><br/>
    <select (change)="updateType($event.target.value)">
        <option value="sine">Sine</option>
        <option value="sawtooth" selected>Sawtooth</option>    
        <option value="square">Square</option>
        <option value="triangle">Triangle</option>
    </select>
</div>
<br/>
<div><label>Octave</label><br/>
    <select (change)="updateOctave($event.target.value)">
        <option value="-2">-2</option>    
        <option value="-1">-1</option>
        <option value="0" selected>0</option>
        <option value="1">1</option>
        <option value="2">2</option>
    </select></div>
<br/>
<div><knob #knobDetune label="Detune" (change)="updateDetune($event)"></knob></div>
`
})
export class OscillatorComponent implements IAudioNodeComponent, OnInit {
    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;
    private readonly oscillator: OscillatorNode;

    @Input('name')
    name: String = 'Oscillator';

    //TODO: Portamento needs to be a global setting
    private portamento: number = 0.05;
    private octave: number = 0;

    private readonly minDetune: number = -100;
    private readonly maxDetune: number = 100;

    @ViewChild('knobDetune')
    private knobDetune: KnobComponent;

    constructor(audioContext: AudioContextService, inputService: InputService) {
        this.audioContext = audioContext;
        this.inputService = inputService;

        this.inputService.noteChange$.subscribe((number: number) => {
            this.noteChange(number);
        });

        this.oscillator = this.audioContext.context().createOscillator();
        this.oscillator.start();
        this.oscillator.type = 'sawtooth';
    }

    ngOnInit(): void {
        this.knobDetune.setInitialValue(Utilities.scaleToPercent(this.oscillator.detune.value, this.minDetune, this.maxDetune));
    }

    node(): AudioNode {
        return this.oscillator;
    }

    updateType(type: OscillatorType) {
        this.oscillator.type = type;
    }

    updateOctave(octave: string) {
        this.octave = parseInt(octave, 10);
    }

    updateDetune(value: number) {
        this.oscillator.detune.setValueAtTime(Utilities.scaleFromPercent(value, this.minDetune, this.maxDetune), 0);
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private noteChange = (number: number) => {
        let octavedNoteNumber = number + 12 * this.octave;
        if (octavedNoteNumber < 1) {
            octavedNoteNumber = 1;
        }
        if (octavedNoteNumber > 127) {
            octavedNoteNumber = 127;
        }

        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(octavedNoteNumber), 0, this.portamento);
    }
}