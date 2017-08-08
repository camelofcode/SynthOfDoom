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
var KeyboardInputService = (function () {
    function KeyboardInputService() {
        var _this = this;
        this.noteOnSource = new Subject_1.Subject();
        this.noteOffSource = new Subject_1.Subject();
        this.noteOn$ = this.noteOnSource.asObservable();
        this.noteOff$ = this.noteOffSource.asObservable();
        //Basic single octave keyboard -> midi note mapping
        this.mappings = {
            'q': 60, '2': 61, 'w': 62, '3': 63, 'e': 64, 'r': 65, '5': 66, 't': 67, '6': 68, 'y': 69, '7': 70, 'u': 71, 'i': 72
        };
        window.addEventListener('keydown', function ($event) {
            if (_this.mappings.hasOwnProperty($event.key)) {
                var note = _this.mappings[$event.key];
                _this.noteOnSource.next({
                    number: note,
                    velocity: 100
                });
            }
        });
        window.addEventListener('keyup', function ($event) {
            if (_this.mappings.hasOwnProperty($event.key)) {
                var note = _this.mappings[$event.key];
                _this.noteOffSource.next({
                    number: note
                });
            }
        });
    }
    return KeyboardInputService;
}());
KeyboardInputService = __decorate([
    core_1.Injectable(),
    __metadata("design:paramtypes", [])
], KeyboardInputService);
exports.KeyboardInputService = KeyboardInputService;
//# sourceMappingURL=keyboard.input.service.js.map