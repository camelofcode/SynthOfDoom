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
var input_service_1 = require("../services/input.service");
var audioContext_service_1 = require("../services/audioContext.service");
var OscillatorComponent = (function () {
    function OscillatorComponent(audioContext, inputService) {
        var _this = this;
        this.portamento = 0.05;
        this.frequencyFromNoteNumber = function (note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        };
        this.noteChange = function (number) {
            _this.oscillator.frequency.cancelScheduledValues(0);
            _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(number), 0, _this.portamento);
        };
        this.audioContext = audioContext;
        this.inputService = inputService;
        this.inputService.noteChange$.subscribe(function (number) {
            _this.noteChange(number);
        });
        this.oscillator = this.audioContext.context().createOscillator();
        this.oscillator.type = 'sine';
        this.oscillator.start();
    }
    OscillatorComponent.prototype.node = function () {
        return this.oscillator;
    };
    OscillatorComponent.prototype.updateType = function (type) {
        this.oscillator.type = type;
    };
    return OscillatorComponent;
}());
OscillatorComponent = __decorate([
    core_1.Component({
        selector: 'oscillator',
        template: "<p>Yo dawg this is an oscillator component</p>\n<label>Waveform</label>\n<select (change)=\"updateType($event.target.value)\">\n    <option value=\"sine\">Sine</option>\n    <option value=\"sawtooth\">Sawtooth</option>\n    <option value=\"square\">Square</option>\n    <option value=\"triangle\">Triangle</option>\n</select>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService])
], OscillatorComponent);
exports.OscillatorComponent = OscillatorComponent;
//# sourceMappingURL=oscillator.component.js.map