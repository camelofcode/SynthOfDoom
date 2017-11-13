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
var DelayFxComponent = /** @class */ (function (_super) {
    __extends(DelayFxComponent, _super);
    function DelayFxComponent(audioContextService) {
        var _this = _super.call(this, audioContextService) || this;
        _this.minDelay = 0.01;
        _this.maxDelay = 2.0;
        _this.minFilter = 200;
        _this.maxFilter = 5000;
        _this.delay = _this.context.createDelay(_this.maxDelay);
        _this.feedback = _this.context.createGain();
        _this.filter = _this.context.createBiquadFilter();
        _this.saturation = _this.context.createScriptProcessor();
        _this.makeup = _this.context.createGain();
        _this.delay.delayTime.setValueAtTime(0.5, 0);
        _this.feedback.gain.setValueAtTime(0.5, 0);
        _this.makeup.gain.setValueAtTime(2.0, 0);
        _this.filter.type = 'lowpass';
        _this.filter.frequency.setValueAtTime(1000, 0);
        _this.saturation.onaudioprocess = function (event) {
            var inputL = event.inputBuffer.getChannelData(0);
            var inputR = event.inputBuffer.getChannelData(1);
            var outputL = event.outputBuffer.getChannelData(0);
            var outputR = event.outputBuffer.getChannelData(1);
            var driveKnob = 0.0;
            var preSatL;
            var preSatR;
            for (var i = 0; i < inputL.length; i++) {
                preSatL = inputL[i] * ((driveKnob + 0.1) * 1.2);
                preSatR = inputR[i] * ((driveKnob + 0.1) * 1.2);
                //http://tap-plugins.sourceforge.net/ladspa/sigmoid.html
                outputL[i] = (2 / (1 + (Math.pow(Math.E, (-5 * preSatL)))) - 1) * 0.5;
                outputR[i] = (2 / (1 + (Math.pow(Math.E, (-5 * preSatR)))) - 1) * 0.5;
            }
        };
        _this.delay.connect(_this.feedback);
        _this.feedback.connect(_this.filter);
        _this.filter.connect(_this.delay);
        _this.delay.connect(_this.saturation);
        _this.saturation.connect(_this.makeup);
        _this.connectFxChain(_this.delay, _this.makeup);
        return _this;
    }
    DelayFxComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.knobMix.init(0, 1, 0.5, function (value) {
            _this.updateMix(value);
        });
        this.knobTime.init(this.minDelay, this.maxDelay, 0.5, function (value) {
            _this.delay.delayTime.cancelScheduledValues(0);
            _this.delay.delayTime.setTargetAtTime(value, _this.context.currentTime, 0.1);
        });
        this.knobFeedback.init(0, 1, 0.5, function (value) {
            _this.feedback.gain.setValueAtTime(value, 0);
        });
        this.knobFilter.init(this.minFilter, this.maxFilter, 1000, function (value) {
            _this.filter.frequency.setValueAtTime(value, 0);
        });
    };
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
    __decorate([
        core_1.ViewChild('knobFilter'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], DelayFxComponent.prototype, "knobFilter", void 0);
    DelayFxComponent = __decorate([
        core_1.Component({
            selector: 'delay',
            template: "<h4>Delay</h4>\n<knob #knobTime label=\"Time\" unit=\"s\"></knob>\n<knob #knobFeedback label=\"Feedback\" unit=\"%\"></knob>\n<knob #knobFilter label=\"Filter\" unit=\"Hz\"></knob>\n<knob #knobMix label=\"Mix\" unit=\"%\"></knob>\n<input #switchOn type=\"checkbox\" (change)=\"updateOn($event)\"/>\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
    ], DelayFxComponent);
    return DelayFxComponent;
}(fx_component_1.FxComponent));
exports.DelayFxComponent = DelayFxComponent;
//# sourceMappingURL=delay.fx.component.js.map