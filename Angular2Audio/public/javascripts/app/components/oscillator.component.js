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
var lfoTarget_service_1 = require("../services/lfoTarget.service");
var knob_component_1 = require("./ui/knob.component");
var lfoTarget_1 = require("../models/lfoTarget");
var utilities_1 = require("../supporting/utilities");
var OscillatorComponent = /** @class */ (function () {
    function OscillatorComponent(audioContext, inputService, lfoTargetService) {
        var _this = this;
        this.name = 'Oscillator';
        //TODO: Portamento needs to be a global setting
        this.portamento = 0.05;
        this.octave = 0;
        this.minDetune = -100;
        this.maxDetune = 100;
        this.frequencyFromNoteNumber = function (note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        };
        this.noteChange = function (number) {
            var octavedNoteNumber = number + 12 * _this.octave;
            if (octavedNoteNumber < 1) {
                octavedNoteNumber = 1;
            }
            if (octavedNoteNumber > 127) {
                octavedNoteNumber = 127;
            }
            _this.oscillator.frequency.cancelScheduledValues(0);
            _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(octavedNoteNumber), 0, _this.portamento);
        };
        this.audioContext = audioContext;
        this.inputService = inputService;
        this.lfoTargetService = lfoTargetService;
        this.inputService.noteChange$.subscribe(function (number) {
            _this.noteChange(number);
        });
        this.oscillator = this.audioContext.context().createOscillator();
        this.oscillator.start();
        this.oscillator.type = 'sawtooth';
    }
    OscillatorComponent.prototype.ngOnInit = function () {
        this.knobDetune.setInitialValue(utilities_1.default.scaleToPercent(this.oscillator.detune.value, this.minDetune, this.maxDetune));
    };
    OscillatorComponent.prototype.node = function () {
        return this.oscillator;
    };
    OscillatorComponent.prototype.registerTargets = function (componentName) {
        var id = componentName.toLowerCase().replace(' ', '') + 'Detune';
        var name = componentName + ' Detune';
        this.lfoTargetService.registerTarget(new lfoTarget_1.LfoTarget(id, name, 1, 100, this.oscillator.detune));
    };
    OscillatorComponent.prototype.updateType = function (type) {
        this.oscillator.type = type;
    };
    OscillatorComponent.prototype.updateOctave = function (octave) {
        this.octave = parseInt(octave, 10);
    };
    OscillatorComponent.prototype.updateDetune = function (value) {
        this.oscillator.detune.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minDetune, this.maxDetune), 0);
    };
    __decorate([
        core_1.Input('name'),
        __metadata("design:type", String)
    ], OscillatorComponent.prototype, "name", void 0);
    __decorate([
        core_1.ViewChild('knobDetune'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], OscillatorComponent.prototype, "knobDetune", void 0);
    OscillatorComponent = __decorate([
        core_1.Component({
            selector: 'oscillator',
            template: "<h4>{{name}}</h4>\n<div><label>Waveform</label><br/>\n    <select (change)=\"updateType($event.target.value)\">\n        <option value=\"sine\">Sine</option>\n        <option value=\"sawtooth\" selected>Sawtooth</option>    \n        <option value=\"square\">Square</option>\n        <option value=\"triangle\">Triangle</option>\n    </select>\n</div>\n<br/>\n<div><label>Octave</label><br/>\n    <select (change)=\"updateOctave($event.target.value)\">\n        <option value=\"-2\">-2</option>    \n        <option value=\"-1\">-1</option>\n        <option value=\"0\" selected>0</option>\n        <option value=\"1\">1</option>\n        <option value=\"2\">2</option>\n    </select></div>\n<br/>\n<div><knob #knobDetune label=\"Detune\" (change)=\"updateDetune($event)\"></knob></div>\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService, lfoTarget_service_1.LfoTargetService])
    ], OscillatorComponent);
    return OscillatorComponent;
}());
exports.OscillatorComponent = OscillatorComponent;
//# sourceMappingURL=oscillator.component.js.map