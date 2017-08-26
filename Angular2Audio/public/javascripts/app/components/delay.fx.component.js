"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var audioContext_service_1 = require("../services/audioContext.service");
var knob_component_1 = require("./ui/knob.component");
var fx_component_1 = require("./fx.component");
var utilities_1 = require("../supporting/utilities");
var DelayFxComponent = (function (_super) {
    __extends(DelayFxComponent, _super);
    function DelayFxComponent(audioContextService) {
        var _this = _super.call(this, audioContextService) || this;
        _this.minDelay = 0.01;
        _this.maxDelay = 2.0;
        _this.audioNode = _this.context.createDelay(_this.maxDelay);
        _this.feedback = _this.context.createGain();
        _this.audioNode.delayTime.setValueAtTime(0.5, 0);
        _this.feedback.gain.setValueAtTime(0.5, 0);
        _this.audioNode.connect(_this.feedback);
        _this.feedback.connect(_this.audioNode);
        return _this;
    }
    DelayFxComponent.prototype.ngOnInit = function () {
        this.knobMix.setInitialValue(utilities_1.default.scaleToPercent(0.5, 0, 1));
        this.knobTime.setInitialValue(utilities_1.default.scaleToPercent(0.5, this.minDelay, this.maxDelay));
        this.knobFeedback.setInitialValue(utilities_1.default.scaleToPercent(0.5, 0, 1));
    };
    DelayFxComponent.prototype.updateTime = function (value) {
        this.audioNode.delayTime.cancelScheduledValues(0);
        this.audioNode.delayTime.setTargetAtTime(utilities_1.default.scaleFromPercent(value, this.minDelay, this.maxDelay), this.context.currentTime, 0.1);
    };
    DelayFxComponent.prototype.updateFeedback = function (value) {
        this.feedback.gain.setValueAtTime(utilities_1.default.scaleFromPercent(value, 0, 1), 0);
    };
    return DelayFxComponent;
}(fx_component_1.FxComponent));
__decorate([
    core_1.ViewChild('knobMix'),
    __metadata("design:type", knob_component_1.KnobComponent)
], DelayFxComponent.prototype, "knobMix", void 0);
__decorate([
    core_1.ViewChild('knobFeedback'),
    __metadata("design:type", knob_component_1.KnobComponent)
], DelayFxComponent.prototype, "knobFeedback", void 0);
__decorate([
    core_1.ViewChild('knobTime'),
    __metadata("design:type", knob_component_1.KnobComponent)
], DelayFxComponent.prototype, "knobTime", void 0);
DelayFxComponent = __decorate([
    core_1.Component({
        selector: 'delay',
        template: "<h4>Delay</h4>\n<knob #knobTime label=\"Time\" (change)=\"updateTime($event)\"></knob>\n<knob #knobFeedback label=\"Feedback\" (change)=\"updateFeedback($event)\"></knob>\n<knob #knobMix label=\"Mix\" (change)=\"updateMix($event)\"></knob>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], DelayFxComponent);
exports.DelayFxComponent = DelayFxComponent;
//# sourceMappingURL=delay.fx.component.js.map