import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<h1>Hello {{name}}</h1>`
})
export class AppComponent implements OnInit, AfterViewInit {

    private audioContext: AudioContext;

    private oscillator: OscillatorNode;
    private midiAccess:any;

    @HostListener('window:keydown', ['$event'])
    onKeyDown($event: any) {
        let freq = 0;
        switch ($event.key) {
            case 'q':
                {
                    freq = 261.63; //C
                    break;
                }
            case '2':
                {
                    freq = 277.18; //C#
                    break;
                }
            case 'w':
                {
                    freq = 293.66; //D
                    break;
                }
            case '3':
                {
                    freq = 311.13; //D#
                    break;
                }
            case 'e':
                {
                    freq = 329.63; //E
                    break;
                }
            case 'r':
                {
                    freq = 349.23; //F
                    break;
                }
            case '5':
                {
                    freq = 369.99; //F#
                    break;
                }
            case 't':
                {
                    freq = 392.00; //G
                    break;
                }
            case '6':
                {
                    freq = 415.30; //G#
                    break;
                }
            case 'y':
                {
                    freq = 440.00; //A
                    break;
                }
            case '7':
                {
                    freq = 466.16; //A#
                    break;
                }
            case 'u':
                {
                    freq = 493.88; //B
                    break;
                }
        }

        this.oscillator.frequency.value = freq;


        this.oscillator.connect(this.audioContext.destination);
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp($event: any) {
        this.oscillator.disconnect(this.audioContext.destination);
    }

    name = 'Angular';

    private onMidiInit = (midi: any) => {
        this.midiAccess = midi;

        var haveAtLeastOneDevice = false;
        var inputs = this.midiAccess.inputs.values();
        for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = this.midiMessageEventHandler;
            haveAtLeastOneDevice = true;
        }
        if (!haveAtLeastOneDevice)
            alert('No MIDI input devices present.  You\'re gonna have a bad time.');
    }

    private onMidiReject = (err: any) => {
        alert('The MIDI system failed to start.  You\'re gonna have a bad time.');
    }

    private midiMessageEventHandler = (event: any) => {
        // Mask off the lower nibble (MIDI channel, which we don't care about)
        switch (event.data[0] & 0xf0) {
        case 0x90:
            if (event.data[2] !== 0) {  // if velocity != 0, this is a note-on message
                this.noteOn(event.data[1]);
                return;
            }
        // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
        case 0x80:
            this.noteOff(event.data[1]);
            return;
        }
    }

    private frequencyFromNoteNumber = (note: number) => {
        return 440 * Math.pow(2, (note - 69) / 12);
    }

    private noteOn = (noteNumber: number) => {
        this.oscillator.frequency.value = this.frequencyFromNoteNumber(noteNumber);
        this.oscillator.connect(this.audioContext.destination);
    }

    private noteOff = (noteNumber: number) => {
        this.oscillator.disconnect(this.audioContext.destination);
    }

    ngOnInit(): void {
        this.audioContext = new AudioContext();
        
        this.oscillator = this.audioContext.createOscillator();

        this.oscillator.type = 'sawtooth';

        this.oscillator.frequency.value = 261.63; //C

        this.oscillator.start();
    }

    ngAfterViewInit(): void {
        if (navigator['requestMIDIAccess'])
            navigator['requestMIDIAccess']().then(this.onMidiInit, this.onMidiReject);
        else
            alert("No MIDI support present in your browser.  You're gonna have a bad time.");
    }
}
