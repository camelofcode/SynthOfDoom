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
var EnvelopeComponent = (function () {
    function EnvelopeComponent(audioContext, inputService) {
        var _this = this;
        this.attack = 0.5;
        this.release = 0.5;
        this.velocityToGain = function (velocity) {
            return velocity / 127.0;
        };
        this.velocityOn = function (velocity) {
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setTargetAtTime(_this.velocityToGain(velocity), 0, _this.attack);
        };
        this.velocityOff = function () {
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setTargetAtTime(0.0, 0, _this.release);
        };
        this.audioContext = audioContext;
        this.inputService = inputService;
        this.inputService.velocityOn$.subscribe(function (velocity) {
            _this.velocityOn(velocity);
        });
        this.inputService.velocityOff$.subscribe(function () {
            _this.velocityOff();
        });
        this.envelope = this.audioContext.context().createGain();
        this.envelope.gain.value = 0.0;
    }
    EnvelopeComponent.prototype.node = function () {
        return this.envelope;
    };
    return EnvelopeComponent;
}());
EnvelopeComponent = __decorate([
    core_1.Component({
        selector: 'envelope',
        template: "<p>Yo dawg this is an envelope component</p>"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService])
], EnvelopeComponent);
exports.EnvelopeComponent = EnvelopeComponent;
//# sourceMappingURL=envelope.component.js.map