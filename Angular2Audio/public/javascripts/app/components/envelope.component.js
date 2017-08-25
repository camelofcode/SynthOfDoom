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
var input_service_1 = require("../services/input.service");
var audioContext_service_1 = require("../services/audioContext.service");
var knob_component_1 = require("./ui/knob.component");
var utilities_1 = require("../supporting/utilities");
var EnvelopeComponent = (function () {
    function EnvelopeComponent(audioContextService, inputService) {
        var _this = this;
        this.audioContextService = audioContextService;
        this.attack = 0.5;
        this.decay = 0.5;
        this.sustain = 0.5;
        this.release = 0.5;
        this.minAttack = 0;
        this.maxAttack = 2;
        this.minDecay = 0;
        this.maxDecay = 2;
        this.minSustain = 0;
        this.maxSustain = 1;
        this.minRelease = 0;
        this.maxRelease = 2;
        this.velocityToGain = function (velocity) {
            return velocity / 127.0;
        };
        this.velocityOn = function (velocity) {
            var time = _this.audioContext.currentTime;
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setValueAtTime(0, 0);
            _this.envelope.gain.linearRampToValueAtTime(_this.velocityToGain(velocity), time + _this.attack);
            _this.envelope.gain.linearRampToValueAtTime(_this.velocityToGain(velocity) * _this.sustain, time + _this.attack + _this.decay);
        };
        this.velocityOff = function () {
            var time = _this.audioContext.currentTime;
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.linearRampToValueAtTime(0.0, time + _this.release);
        };
        this.audioContext = audioContextService.context();
        this.inputService = inputService;
        this.inputService.velocityOn$.subscribe(function (velocity) {
            _this.velocityOn(velocity);
        });
        this.inputService.velocityOff$.subscribe(function () {
            _this.velocityOff();
        });
        this.envelope = this.audioContext.createGain();
        this.envelope.gain.value = 0.0;
    }
    EnvelopeComponent.prototype.ngOnInit = function () {
        this.knobAttack.setInitialValue(utilities_1.default.scaleToPercent(this.attack, this.minAttack, this.maxAttack));
        this.knobDecay.setInitialValue(utilities_1.default.scaleToPercent(this.decay, this.minDecay, this.maxDecay));
        this.knobSustain.setInitialValue(utilities_1.default.scaleToPercent(this.sustain, this.minSustain, this.maxSustain));
        this.knobRelease.setInitialValue(utilities_1.default.scaleToPercent(this.release, this.minRelease, this.maxRelease));
    };
    EnvelopeComponent.prototype.node = function () {
        return this.envelope;
    };
    EnvelopeComponent.prototype.updateAttack = function (value) {
        this.attack = utilities_1.default.scaleFromPercent(value, this.minAttack, this.maxAttack);
    };
    EnvelopeComponent.prototype.updateDecay = function (value) {
        this.decay = utilities_1.default.scaleFromPercent(value, this.minDecay, this.maxDecay);
    };
    EnvelopeComponent.prototype.updateSustain = function (value) {
        this.sustain = utilities_1.default.scaleFromPercent(value, this.minSustain, this.maxSustain);
    };
    EnvelopeComponent.prototype.updateRelease = function (value) {
        this.release = utilities_1.default.scaleFromPercent(value, this.minRelease, this.maxRelease);
    };
    return EnvelopeComponent;
}());
__decorate([
    core_1.ViewChild('knobAttack'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobAttack", void 0);
__decorate([
    core_1.ViewChild('knobDecay'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobDecay", void 0);
__decorate([
    core_1.ViewChild('knobSustain'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobSustain", void 0);
__decorate([
    core_1.ViewChild('knobRelease'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobRelease", void 0);
EnvelopeComponent = __decorate([
    core_1.Component({
        selector: 'envelope',
        template: "<h4>Envelope</h4>\n<knob #knobAttack label=\"Attack\" (change)=\"updateAttack($event)\"></knob>\n<knob #knobDecay label=\"Decay\" (change)=\"updateDecay($event)\"></knob>\n<knob #knobSustain label=\"Sustain\" (change)=\"updateSustain($event)\"></knob>\n<knob #knobRelease label=\"Release\" (change)=\"updateRelease($event)\"></knob>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService])
], EnvelopeComponent);
exports.EnvelopeComponent = EnvelopeComponent;
//# sourceMappingURL=envelope.component.js.map