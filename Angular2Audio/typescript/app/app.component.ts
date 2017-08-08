import { Component, OnInit } from '@angular/core';
import { InputService } from './services/input.service';

import { NoteOnMessage } from './models/noteOnMessage';
import { NoteOffMessage } from './models/noteOffMessage';

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
    private activeNotes: number[] = new Array();

    name = 'Angular'; 

    constructor(inputService: InputService) {
        this.inputService = inputService;

        this.inputService.noteOn$.subscribe((message: NoteOnMessage) => {
            this.noteOn(message.number, message.velocity);
        });

        this.inputService.noteOff$.subscribe((message: NoteOffMessage) => {
            this.noteOff(message.number);
        });
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private velocityToGain = (velocity: number) => {
        return velocity / 127.0;
    }

    private noteOn = (noteNumber: number, velocity: number) => {
        this.activeNotes.push(noteNumber);
        this.oscillator.frequency.cancelScheduledValues(0);
        this.oscillator.frequency.setTargetAtTime(this.frequencyFromNoteNumber(noteNumber), 0, this.portamento);
        this.envelope.gain.cancelScheduledValues(0);
        this.envelope.gain.setTargetAtTime(this.velocityToGain(velocity), 0, this.attack);
    }

    private noteOff = (noteNumber: number) => {
        var position = this.activeNotes.indexOf(noteNumber);
        if (position > -1) {
            this.activeNotes.splice(position, 1);
        }

        if (this.activeNotes.length < 1) {
            this.envelope.gain.cancelScheduledValues(0);
            this.envelope.gain.setTargetAtTime(0.0, 0, this.release);
        } else {
            this.oscillator.frequency.cancelScheduledValues(0);
            this.oscillator.frequency.setTargetAtTime(
                this.frequencyFromNoteNumber(this.activeNotes[this.activeNotes.length - 1]),
                0,
                this.portamento);
        }
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
