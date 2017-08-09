import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { KeyboardInputService } from './keyboard.input.service';
import { MidiInputService } from './midi.input.service';

import { NoteOnMessage } from '../models/noteOnMessage';
import { NoteOffMessage } from '../models/noteOffMessage';

@Injectable()
export class InputService {
    private readonly keyboardInputService: KeyboardInputService;
    private readonly midiInputService: MidiInputService;

    private noteChangeSource = new Subject<number>();
    private velocityOnSource = new Subject<number>();
    private velocityOffSource = new Subject();
    private activeNotes: number[] = new Array();

    noteChange$ = this.noteChangeSource.asObservable();
    velocityOn$ = this.velocityOnSource.asObservable();
    velocityOff$ = this.velocityOffSource.asObservable();

    constructor(keyboardInputService: KeyboardInputService, midiInputService: MidiInputService) {
        this.keyboardInputService = keyboardInputService;
        this.midiInputService = midiInputService;

        this.midiInputService.ngOnInit();

        this.midiInputService.noteOn$.subscribe((message: NoteOnMessage) => {
            this.noteOn(message.number, message.velocity);
        });

        this.midiInputService.noteOff$.subscribe((message: NoteOffMessage) => {
            this.noteOff(message.number);
        });

        this.keyboardInputService.noteOn$.subscribe((message: NoteOnMessage) => {
            this.noteOn(message.number, message.velocity);
        });

        this.keyboardInputService.noteOff$.subscribe((message: NoteOffMessage) => {
            this.noteOff(message.number);
        });
    }

    private noteOn = (noteNumber: number, velocity: number) => {
        if (this.activeNotes.indexOf(noteNumber) > -1) {
            return;
        }

        this.activeNotes.push(noteNumber);

        this.noteChangeSource.next(noteNumber);
        this.velocityOnSource.next(velocity);
    }

    private noteOff = (noteNumber: number) => {
        var position = this.activeNotes.indexOf(noteNumber);
        if (position > -1) {
            this.activeNotes.splice(position, 1);
        }

        if (this.activeNotes.length < 1) {
            this.velocityOffSource.next();
        } else {
            this.noteChangeSource.next(this.activeNotes[this.activeNotes.length - 1]);
        }
    }
}