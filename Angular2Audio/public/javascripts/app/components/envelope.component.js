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
var knob_component_1 = require("./ui/knob.component");
var EnvelopeComponent = /** @class */ (function () {
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
        this.name = "Envelope";
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
    EnvelopeComponent.prototype.ngAfterViewChecked = function () {
        var _this = this;
        this.knobAttack.init(this.name, this.minAttack, this.maxAttack, this.attack, function (value) {
            _this.attack = value;
        });
        this.knobDecay.init(this.name, this.minDecay, this.maxDecay, this.decay, function (value) {
            _this.decay = value;
        });
        this.knobSustain.init(this.name, this.minSustain, this.maxSustain, this.sustain, function (value) {
            _this.sustain = value;
        });
        this.knobRelease.init(this.name, this.minRelease, this.maxRelease, this.release, function (value) {
            _this.sustain = value;
        });
    };
    EnvelopeComponent.prototype.node = function () {
        return this.envelope;
    };
    EnvelopeComponent.prototype.registerTargets = function () {
        return;
    };
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
            template: "<h4>Envelope</h4>\n<knob #knobAttack label=\"Attack\" unit=\"s\"></knob>\n<knob #knobDecay label=\"Decay\" unit=\"s\"></knob>\n<knob #knobSustain label=\"Sustain\" unit=\"s\"></knob>\n<knob #knobRelease label=\"Release\" unit=\"s\"></knob>\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService])
    ], EnvelopeComponent);
    return EnvelopeComponent;
}());
exports.EnvelopeComponent = EnvelopeComponent;
//# sourceMappingURL=envelope.component.js.map