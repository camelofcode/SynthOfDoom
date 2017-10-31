import { Injectable } from '@angular/core';
import { MidiInputService } from './midi.input.service';

import { ControlChangeMessage } from '../models/controlChangeMessage';

import Utilities from '../supporting/utilities';

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
        this.target(Utilities.scaleToPercentFromMidi(value));
    }
}