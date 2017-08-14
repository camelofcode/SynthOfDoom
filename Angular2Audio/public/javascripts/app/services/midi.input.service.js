"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var MidiInputService = (function () {
    function MidiInputService() {
        var _this = this;
        this.noteOnSource = new Subject_1.Subject();
        this.noteOffSource = new Subject_1.Subject();
        this.noteOn$ = this.noteOnSource.asObservable();
        this.noteOff$ = this.noteOffSource.asObservable();
        this.onMidiInit = function (midi) {
            _this.midiAccess = midi;
            var haveAtLeastOneDevice = false;
            var inputs = _this.midiAccess.inputs.values();
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                input.value.onmidimessage = _this.midiMessageEventHandler;
                haveAtLeastOneDevice = true;
            }
            if (!haveAtLeastOneDevice) {
                console.log('No MIDI input devices present.');
            }
        };
        this.onMidiReject = function (err) {
            console.log('The MIDI system failed to start.');
        };
        this.midiMessageEventHandler = function (event) {
            // Mask off the lower nibble (MIDI channel, which we don't care about)
            switch (event.data[0] & 0xf0) {
                case 0x90:
                    if (event.data[2] !== 0) {
                        _this.noteOnSource.next({
                            number: event.data[1],
                            velocity: event.data[2]
                        });
                        return;
                    }
                // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
                case 0x80:
                    _this.noteOffSource.next({
                        number: event.data[1]
                    });
                    return;
            }
        };
    }
    MidiInputService.prototype.ngOnInit = function () {
        if (navigator['requestMIDIAccess']) {
            navigator['requestMIDIAccess']().then(this.onMidiInit, this.onMidiReject);
        }
        else {
            console.log('No MIDI support present in your browser.');
        }
    };
    return MidiInputService;
}());
MidiInputService = __decorate([
    core_1.Injectable()
], MidiInputService);
exports.MidiInputService = MidiInputService;
//# sourceMappingURL=midi.input.service.js.map