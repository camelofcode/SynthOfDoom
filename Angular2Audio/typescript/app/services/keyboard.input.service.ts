import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { NoteOnMessage } from '../models/noteOnMessage';
import { NoteOffMessage } from '../models/noteOffMessage';

@Injectable()
export class KeyboardInputService {
    private readonly mappings: any;

    private noteOnSource = new Subject<NoteOnMessage>();
    private noteOffSource = new Subject<NoteOffMessage>();

    noteOn$ = this.noteOnSource.asObservable();
    noteOff$ = this.noteOffSource.asObservable();

    constructor() {
        //Basic single octave keyboard -> midi note mapping
        this.mappings = {
            'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, 'i': 72
        }

        window.addEventListener('keydown', ($event: KeyboardEvent) => {
            if (this.mappings.hasOwnProperty($event.key)) {
                let note = this.mappings[$event.key];
                this.noteOnSource.next({
                    number: note,
                    velocity: 100
                } as NoteOnMessage);
            }
        });

        window.addEventListener('keyup', ($event: KeyboardEvent) => {
            if (this.mappings.hasOwnProperty($event.key)) {
                let note = this.mappings[$event.key];
                this.noteOffSource.next({
                    number: note
                } as NoteOffMessage);
            }
        });
    }
}