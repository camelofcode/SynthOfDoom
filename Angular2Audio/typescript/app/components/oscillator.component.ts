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
    private readonly inputService: InputService;
    private readonly audioContext: AudioContextService;
    private readonly oscillator: OscillatorNode;

    private portamento = 0.05;

    constructor(audioContext: AudioContextService, inputService: InputService) {
        this.audioContext = audioContext;
        this.inputService = inputService;

        this.inputService.noteChange$.subscribe((number: number) => {
            this.noteChange(number);
        });

        this.oscillator = this.audioContext.context().createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.start();
    }

    node(): AudioNode {
        return this.oscillator;
    }

    updateType(type: string) {
        this.oscillator.type = type;
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private noteChange = (number: number) => {
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(number), 0, this.portamento);
    }
}