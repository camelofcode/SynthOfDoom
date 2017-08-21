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
var utilities_1 = require("../supporting/utilities");
var MixerComponent = (function () {
    function MixerComponent(audioContext) {
        this.minGain = 0;
        this.maxGain = 1;
        //TODO: make this settable. Doesn't need it for the synth, but will make it easier to reuse as a real mixer
        this.numberOfInputs = 3;
        this.audioContext = audioContext;
        this.inputNodes = new Array(this.numberOfInputs);
        this.outputNode = this.audioContext.context().createGain();
        this.outputNode.gain.value = 1.0;
        for (var i = 0; i < this.numberOfInputs; i++) {
            var newNode = this.audioContext.context().createGain();
            newNode.gain.value = 0.8;
            this.inputNodes[i] = newNode;
        }
    }
    MixerComponent.prototype.ngAfterViewInit = function () {
        for (var i = 0; i < this.numberOfInputs; i++) {
            this.gainKnobs.toArray()[i].setInitialValue(utilities_1.default.scaleToPercent(this.inputNodes[i].gain.value, this.minGain, this.maxGain));
        }
    };
    MixerComponent.prototype.inputs = function () {
        return this.inputNodes;
    };
    MixerComponent.prototype.output = function () {
        for (var i = 0; i < this.numberOfInputs; i++) {
            this.inputNodes[i].connect(this.outputNode);
        }
        return this.outputNode;
    };
    MixerComponent.prototype.updateOscillator = function (value, target) {
        this.inputNodes[target].gain.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    };
    return MixerComponent;
}());
__decorate([
    core_1.ViewChildren(knob_component_1.KnobComponent),
    __metadata("design:type", core_1.QueryList)
], MixerComponent.prototype, "gainKnobs", void 0);
MixerComponent = __decorate([
    core_1.Component({
        selector: 'mixer',
        template: "<h4>Mixer</h4>\n<ng-template ngFor let-item [ngForOf]=\"inputNodes\" let-currentIndex=\"index + 1\" let-i=\"index\">\n    <knob label=\"Oscillator {{currentIndex}}\" (change)=\"updateOscillator($event, i)\"></knob>\n</ng-template>\n"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], MixerComponent);
exports.MixerComponent = MixerComponent;
//# sourceMappingURL=mixer.component.js.map