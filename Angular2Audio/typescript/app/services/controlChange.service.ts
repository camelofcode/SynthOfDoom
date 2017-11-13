import { Injectable } from '@angular/core';
import { MidiInputService } from './midi.input.service';

import { ControlChangeMessage } from '../models/controlChangeMessage';

@Injectable()
export class ControlChangeService {
    private readonly midiInputService: MidiInputService;

    private isMidiLearning: boolean;

    private target: Function;

    constructor(midiInputService: MidiInputService) {
        this.midiInputService = midiInputService;

        this.midiInputService.controlChange$.subscribe((message: ControlChangeMessage) => {
            this.controlChange(message.control, message.value);
        });
    }

    setTarget(target: Function) {
        this.target = target;
    }

    private controlChange = (control: number, value: number) => {
        this.target(this.scaleToPercentFromMidi(value));
    }

    private scaleToMidiFromPercent(value: number) {
        return (127.0 * (value / 100.0));
    }

    private scaleToPercentFromMidi(value: number) {
        return (value / 127.0) * 100.0;
    }
}