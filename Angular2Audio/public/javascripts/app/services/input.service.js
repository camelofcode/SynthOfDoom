"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var keyboard_input_service_1 = require("./keyboard.input.service");
var midi_input_service_1 = require("./midi.input.service");
var InputService = (function () {
    function InputService(keyboardInputService, midiInputService) {
        var _this = this;
        this.noteOnSource = new Subject_1.Subject();
        this.noteOffSource = new Subject_1.Subject();
        this.noteOn$ = this.noteOnSource.asObservable();
        this.noteOff$ = this.noteOffSource.asObservable();
        this.keyboardInputService = keyboardInputService;
        this.midiInputService = midiInputService;
        this.midiInputService.ngOnInit();
        this.midiInputService.noteOn$.subscribe(function (message) {
            _this.noteOnSource.next(message);
        });
        this.midiInputService.noteOff$.subscribe(function (message) {
            _this.noteOffSource.next(message);
        });
        this.keyboardInputService.noteOn$.subscribe(function (message) {
            _this.noteOnSource.next(message);
        });
        this.keyboardInputService.noteOff$.subscribe(function (message) {
            _this.noteOffSource.next(message);
        });
    }
    return InputService;
}());
InputService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [keyboard_input_service_1.KeyboardInputService, midi_input_service_1.MidiInputService])
], InputService);
exports.InputService = InputService;
//# sourceMappingURL=input.service.js.map