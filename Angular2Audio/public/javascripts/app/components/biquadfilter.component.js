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
var audioContext_service_1 = require("../services/audioContext.service");
var knob_component_1 = require("./ui/knob.component");
var utilities_1 = require("../supporting/utilities");
var BiquadFilterComponent = (function () {
    function BiquadFilterComponent(audioContext) {
        this.minFrequency = 30;
        this.maxFrequency = 10000;
        this.minQ = 1;
        this.maxQ = 16;
        this.audioContext = audioContext;
        this.filter = this.audioContext.context().createBiquadFilter();
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 2;
    }
    BiquadFilterComponent.prototype.ngOnInit = function () {
        this.knobFrequency.setInitialValue(utilities_1.default.scaleToPercent(this.filter.frequency.value, this.minFrequency, this.maxFrequency));
        this.knobQ.setInitialValue(utilities_1.default.scaleToPercent(this.filter.Q.value, this.minQ, this.maxQ));
    };
    BiquadFilterComponent.prototype.node = function () {
        return this.filter;
    };
    BiquadFilterComponent.prototype.updateFrequency = function (value) {
        this.filter.frequency.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minFrequency, this.maxFrequency), 0);
    };
    BiquadFilterComponent.prototype.updateQ = function (value) {
        this.filter.Q.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minQ, this.maxQ), 0);
    };
    return BiquadFilterComponent;
}());
__decorate([
    core_1.ViewChild('knobFrequency'),
    __metadata("design:type", knob_component_1.KnobComponent)
], BiquadFilterComponent.prototype, "knobFrequency", void 0);
__decorate([
    core_1.ViewChild('knobQ'),
    __metadata("design:type", knob_component_1.KnobComponent)
], BiquadFilterComponent.prototype, "knobQ", void 0);
BiquadFilterComponent = __decorate([
    core_1.Component({
        selector: 'biquad-filter',
        template: "<h4>Filter</h4>\n<knob #knobFrequency label=\"Cut Off\" (change)=\"updateFrequency($event)\"></knob>\n<knob #knobQ label=\"Resonance\" (change)=\"updateQ($event)\"></knob>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], BiquadFilterComponent);
exports.BiquadFilterComponent = BiquadFilterComponent;
//# sourceMappingURL=biquadfilter.component.js.map