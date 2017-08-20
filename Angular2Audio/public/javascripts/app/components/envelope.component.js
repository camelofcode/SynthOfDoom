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
    EnvelopeComponent.prototype.ngOnInit = function () {
        this.knobAttack.setInitialValue(this.attack * 100);
        this.knobRelease.setInitialValue(this.release * 100);
    };
    EnvelopeComponent.prototype.node = function () {
        return this.envelope;
    };
    EnvelopeComponent.prototype.updateAttack = function (value) {
        this.attack = value / 100.0;
    };
    EnvelopeComponent.prototype.updateRelease = function (value) {
        this.release = value / 100.0;
    };
    return EnvelopeComponent;
}());
__decorate([
    core_1.ViewChild('knobAttack'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobAttack", void 0);
__decorate([
    core_1.ViewChild('knobRelease'),
    __metadata("design:type", knob_component_1.KnobComponent)
], EnvelopeComponent.prototype, "knobRelease", void 0);
EnvelopeComponent = __decorate([
    core_1.Component({
        selector: 'envelope',
        template: "<h4>Envelope</h4>\n<knob label=\"Attack\" #knobAttack [min]=\"0\" [max]=\"100\" [value]=\"50\" [startDegree]=\"200\"  [endDegree]=\"120\" (change)=\"updateAttack($event)\"></knob>\n<knob label=\"Release\" #knobRelease [min]=\"0\" [max]=\"100\" [value]=\"50\" [startDegree]=\"200\"  [endDegree]=\"120\" (change)=\"updateRelease($event)\"></knob>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService])
], EnvelopeComponent);
exports.EnvelopeComponent = EnvelopeComponent;
//# sourceMappingURL=envelope.component.js.map