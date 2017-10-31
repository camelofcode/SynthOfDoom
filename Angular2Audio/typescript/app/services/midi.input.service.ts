import { Injectable, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { NoteOnMessage } from '../models/noteOnMessage';
import { NoteOffMessage } from '../models/noteOffMessage';
import { ControlChangeMessage } from '../models/controlChangeMessage';

@Injectable()
export class MidiInputService implements OnInit {
    private midiAccess: any;
    private noteOnSource = new Subject<NoteOnMessage>();
    private noteOffSource = new Subject<NoteOffMessage>();
    private controlChangeSource = new Subject<ControlChangeMessage>();

    noteOn$ = this.noteOnSource.asObservable();
    noteOff$ = this.noteOffSource.asObservable();
    controlChange$ = this.controlChangeSource.asObservable();

    ngOnInit(): void {
        if (navigator['requestMIDIAccess']) {
            navigator['requestMIDIAccess']().then(this.onMidiInit, this.onMidiReject);
        }
        else {
            console.log('No MIDI support present in your browser.');
        }
    }

    private onMidiInit = (midi: any) => {
        this.midiAccess = midi;

        var haveAtLeastOneDevice = false;
        var inputs = this.midiAccess.inputs.values();
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = this.midiMessageEventHandler;
            haveAtLeastOneDevice = true;
        }
        if (!haveAtLeastOneDevice) {
            console.log('No MIDI input devices present.');
        }
    }

    private onMidiReject = (err: any) => {
        console.log('The MIDI system failed to start.');
    }

    private midiMessageEventHandler = (event: any) => {
        // Mask off the lower nibble (MIDI channel, which we don't care about)
        switch (event.data[0] & 0xf0) {
            case 0x90:
                if (event.data[2] !== 0) {  // if velocity != 0, this is a note-on message
                    this.noteOnSource.next({
                        number: event.data[1],
                        velocity: event.data[2]
                    } as NoteOnMessage);
                    return;
                }
            // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
            case 0x80:
                this.noteOffSource.next({
                    number: event.data[1]
                } as NoteOffMessage);
                return;
            // control change
            case 0xB0:
                this.controlChangeSource.next({
                    control: event.data[1],
                    value: event.data[2]
                } as ControlChangeMessage);
                return;
        }
    }
}