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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Subject_1 = require("rxjs/Subject");
var midi_input_service_1 = require("./midi.input.service");
var ControlChangeService = /** @class */ (function () {
    function ControlChangeService(midiInputService) {
        var _this = this;
        this.targets = new Array();
        this.learntTargets = {};
        this.currentlyLearning = null;
        this.learningStoppedSource = new Subject_1.Subject();
        this.learningStopped$ = this.learningStoppedSource.asObservable();
        this.controlChange = function (control, value) {
            if (_this.currentlyLearning !== null) {
                _this.learntTargets[control] = _this.currentlyLearning;
                _this.currentlyLearning = null;
                _this.learningStoppedSource.next();
            }
            if (_this.learntTargets[control]) {
                _this.learntTargets[control].update(_this.scaleToPercentFromMidi(value));
            }
        };
        this.midiInputService = midiInputService;
        this.midiInputService.controlChange$.subscribe(function (message) {
            _this.controlChange(message.control, message.value);
        });
    }
    ControlChangeService.prototype.getTargets = function () {
        return this.targets;
    };
    ControlChangeService.prototype.registerTarget = function (target) {
        this.targets.push(target);
    };
    ControlChangeService.prototype.beginLearn = function (target) {
        this.currentlyLearning = target;
    };
    ControlChangeService.prototype.cancelLearn = function () {
        this.currentlyLearning = null;
        this.learningStoppedSource.next();
    };
    ControlChangeService.prototype.scaleToMidiFromPercent = function (value) {
        return (127.0 * (value / 100.0));
    };
    ControlChangeService.prototype.scaleToPercentFromMidi = function (value) {
        return (value / 127.0) * 100.0;
    };
    ControlChangeService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [midi_input_service_1.MidiInputService])
    ], ControlChangeService);
    return ControlChangeService;
}());
exports.ControlChangeService = ControlChangeService;
//# sourceMappingURL=controlChange.service.js.map