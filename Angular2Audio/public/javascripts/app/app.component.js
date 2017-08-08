"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var AppComponent = (function () {
    function AppComponent() {
        var _this = this;
        this.attack = 0.5;
        this.release = 0.5;
        this.portamento = 0.05;
        this.activeNotes = new Array();
        //@HostListener('window:keydown', ['$event'])
        //onKeyDown($event: any) {
        //    let freq = 0;
        //    switch ($event.key) {
        //        case 'q':
        //            {
        //                freq = 261.63; //C
        //                break;
        //            }
        //        case '2':
        //            {
        //                freq = 277.18; //C#
        //                break;
        //            }
        //        case 'w':
        //            {
        //                freq = 293.66; //D
        //                break;
        //            }
        //        case '3':
        //            {
        //                freq = 311.13; //D#
        //                break;
        //            }
        //        case 'e':
        //            {
        //                freq = 329.63; //E
        //                break;
        //            }
        //        case 'r':
        //            {
        //                freq = 349.23; //F
        //                break;
        //            }
        //        case '5':
        //            {
        //                freq = 369.99; //F#
        //                break;
        //            }
        //        case 't':
        //            {
        //                freq = 392.00; //G
        //                break;
        //            }
        //        case '6':
        //            {
        //                freq = 415.30; //G#
        //                break;
        //            }
        //        case 'y':
        //            {
        //                freq = 440.00; //A
        //                break;
        //            }
        //        case '7':
        //            {
        //                freq = 466.16; //A#
        //                break;
        //            }
        //        case 'u':
        //            {
        //                freq = 493.88; //B
        //                break;
        //            }
        //    }
        //    this.oscillator.frequency.value = freq;
        //    this.oscillator.connect(this.audioContext.destination);
        //}
        //@HostListener('window:keyup', ['$event'])
        //onKeyUp($event: any) {
        //    this.oscillator.disconnect(this.audioContext.destination);
        //}
        this.name = 'Angular';
        this.onMidiInit = function (midi) {
            _this.midiAccess = midi;
            var haveAtLeastOneDevice = false;
            var inputs = _this.midiAccess.inputs.values();
            for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
                input.value.onmidimessage = _this.midiMessageEventHandler;
                haveAtLeastOneDevice = true;
            }
            if (!haveAtLeastOneDevice)
                alert('No MIDI input devices present.  You\'re gonna have a bad time.');
        };
        this.onMidiReject = function (err) {
            alert('The MIDI system failed to start.  You\'re gonna have a bad time.');
        };
        this.midiMessageEventHandler = function (event) {
            // Mask off the lower nibble (MIDI channel, which we don't care about)
            switch (event.data[0] & 0xf0) {
                case 0x90:
                    if (event.data[2] !== 0) {
                        _this.noteOn(event.data[1], event.data[2]);
                        return;
                    }
                // if velocity == 0, fall thru: it's a note-off.  MIDI's weird, y'all.
                case 0x80:
                    _this.noteOff(event.data[1]);
                    return;
            }
        };
        this.frequencyFromNoteNumber = function (note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        };
        this.velocityToGain = function (velocity) {
            return velocity / 127.0;
        };
        this.noteOn = function (noteNumber, velocity) {
            console.log(velocity);
            _this.activeNotes.push(noteNumber);
            _this.oscillator.frequency.cancelScheduledValues(0);
            _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(noteNumber), 0, _this.portamento);
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setTargetAtTime(_this.velocityToGain(velocity), 0, _this.attack);
        };
        this.noteOff = function (noteNumber) {
            var position = _this.activeNotes.indexOf(noteNumber);
            if (position > -1) {
                _this.activeNotes.splice(position, 1);
            }
            if (_this.activeNotes.length < 1) {
                _this.envelope.gain.cancelScheduledValues(0);
                _this.envelope.gain.setTargetAtTime(0.0, 0, _this.release);
            }
            else {
                _this.oscillator.frequency.cancelScheduledValues(0);
                _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(_this.activeNotes[_this.activeNotes.length - 1]), 0, _this.portamento);
            }
        };
    }
    AppComponent.prototype.ngOnInit = function () {
        this.audioContext = new AudioContext();
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sawtooth';
        this.envelope = this.audioContext.createGain();
        this.oscillator.connect(this.envelope);
        this.envelope.connect(this.audioContext.destination);
        this.envelope.gain.value = 0.0;
        this.oscillator.start();
    };
    AppComponent.prototype.ngAfterViewInit = function () {
        if (navigator['requestMIDIAccess'])
            navigator['requestMIDIAccess']().then(this.onMidiInit, this.onMidiReject);
        else
            alert("No MIDI support present in your browser.  You're gonna have a bad time.");
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "<h1>Hello {{name}}</h1>"
    })
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map