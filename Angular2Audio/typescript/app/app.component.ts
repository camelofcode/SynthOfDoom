import { Component, OnInit } from '@angular/core';
import { InputService } from './services/input.service';

@Component({
    selector: 'my-app',
    template: `<h1>Hello {{name}}</h1>`
})
export class AppComponent implements OnInit {
    private readonly inputService: InputService;

    private audioContext: AudioContext;

    private oscillator: OscillatorNode;
    private envelope: GainNode;
    private attack = 0.5;
    private release = 0.5;
    private portamento = 0.05;

    name = 'Angular';

    constructor(inputService: InputService) {
        this.inputService = inputService;

        this.inputService.noteOn$.subscribe((number: number) => {
            this.noteOn(number);
        });

        this.inputService.velocityOn$.subscribe((velocity: number) => {
            this.velocityOn(velocity);
        });

        this.inputService.noteOff$.subscribe((number: number) => {
            this.noteOff(number);
        });

        this.inputService.velocityOff$.subscribe(() => {
            this.velocityOff();
        });
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private velocityToGain = (velocity: number) => {
        return velocity / 127.0;
    }

    private noteOn = (number: number) => {
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(number), 0, this.portamento);
    }

    private velocityOn = (velocity: number) => {
        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.setTargetAtTime(this.velocityToGain(velocity), 0, this.attack);
    }

    private noteOff = (number: number) => {
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(
            this.frequencyFromNoteNumber(number),
            0,
            this.portamento);
    }

    private velocityOff = () => {
        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
    }

    ngOnInit(): void {
        this.audioContext = new AudioContext();

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sawtooth';

        this.envelope = this.audioContext.createGain();
        this.oscillator.connect(this.envelope);
        this.envelope.connect(this.audioContext.destination);
        this.envelope.gain.value = 0.0;
        this.oscillator.start();
    }
}
