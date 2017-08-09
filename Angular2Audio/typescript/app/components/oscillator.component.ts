import { Component } from '@angular/core';
import { InputService } from '../services/input.service';
import { AudioContextService } from '../services/audioContext.service';

@Component({
    selector: 'oscillator',
    template: `<p>Yo dawg this is an oscillator component</p>
<label>Waveform</label>
<select (change)="updateType($event.target.value)">
    <option value="sine">Sine</option>
    <option value="sawtooth">Sawtooth</option>
    <option value="square">Square</option>
    <option value="triangle">Triangle</option>
</select>
`
})
export class OscillatorComponent implements IAudioNodeComponent {

    node(): AudioNode {
        return this.oscillator;
    }

    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;

    private oscillator: OscillatorNode;
    private portamento = 0.05;

    constructor(audioContext: AudioContextService, inputService: InputService) {
        this.audioContext = audioContext;
        this.inputService = inputService;

        this.inputService.noteOn$.subscribe((number: number) => {
            this.noteOn(number);
        });

        this.inputService.noteOff$.subscribe((number: number) => {
            this.noteOff(number);
        });

        this.oscillator = this.audioContext.context().createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.start();
    }

    updateType(type: string) {
        this.oscillator.type = type;
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private noteOn = (number: number) => {
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(number), 0, this.portamento);
    }

    private noteOff = (number: number) => {
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(
            this.frequencyFromNoteNumber(number),
            0,
            this.portamento);
    }
}