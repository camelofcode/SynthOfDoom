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
var audioContext_service_1 = require("../services/audioContext.service");
var knob_component_1 = require("./ui/knob.component");
var BiquadFilterComponent = (function () {
    function BiquadFilterComponent(audioContext) {
        this.audioContext = audioContext;
        this.filter = this.audioContext.context().createBiquadFilter();
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 2;
    }
    BiquadFilterComponent.prototype.ngOnInit = function () {
        this.knobFrequency.setInitialValue(this.filter.frequency.value);
        this.knobQ.setInitialValue(this.filter.Q.value);
    };
    BiquadFilterComponent.prototype.node = function () {
        return this.filter;
    };
    BiquadFilterComponent.prototype.updateFrequency = function (value) {
        this.filter.frequency.setValueAtTime(value, 0);
    };
    BiquadFilterComponent.prototype.updateQ = function (value) {
        this.filter.Q.setValueAtTime(value, 0);
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
        template: "<p>Yo dawg this is a biquad filter component</p>\n<label>Cutoff</label>\n<knob #knobFrequency class=\"skin1\" [min]=\"50\" [max]=\"2000\" [value]=\"1000\" [startDegree]=\"200\"  [endDegree]=\"120\" (change)=\"updateFrequency($event)\"></knob>\n<label>Resonance</label>\n<knob #knobQ class=\"skin1\" [min]=\"1\" [max]=\"32\" [value]=\"2\" [startDegree]=\"200\"  [endDegree]=\"120\" (change)=\"updateQ($event)\"></knob>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], BiquadFilterComponent);
exports.BiquadFilterComponent = BiquadFilterComponent;
//# sourceMappingURL=biquadfilter.component.js.map