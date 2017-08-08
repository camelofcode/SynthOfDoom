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

    private noteOnSource = new Subject<NoteOnMessage>();
    private noteOffSource = new Subject<NoteOffMessage>();

    noteOn$ = this.noteOnSource.asObservable();
    noteOff$ = this.noteOffSource.asObservable();

    constructor(keyboardInputService: KeyboardInputService, midiInputService: MidiInputService) {
        this.keyboardInputService = keyboardInputService;
        this.midiInputService = midiInputService;

        this.midiInputService.ngOnInit();

        this.midiInputService.noteOn$.subscribe((message: NoteOnMessage) => {
            this.noteOnSource.next(message);
        });

        this.midiInputService.noteOff$.subscribe((message: NoteOffMessage) => {
            this.noteOffSource.next(message);
        });

        this.keyboardInputService.noteOn$.subscribe((message: NoteOnMessage) => {
            this.noteOnSource.next(message);
        });

        this.keyboardInputService.noteOff$.subscribe((message: NoteOffMessage) => {
            this.noteOffSource.next(message);
        });
    }
}