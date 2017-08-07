import { Component, OnInit, HostListener } from '@angular/core';

@Component({
    selector: 'my-app',
    template: `<h1>Hello {{name}}</h1>`,
})
export class AppComponent implements OnInit {
    private audioContext: AudioContext;

    private oscillator: OscillatorNode;

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

    ngOnInit(): void {
        this.audioContext = new AudioContext();

        this.oscillator = this.audioContext.createOscillator();

        this.oscillator.type = 'sine';

        this.oscillator.frequency.value = 261.63; //C

        this.oscillator.start();
    }
}
