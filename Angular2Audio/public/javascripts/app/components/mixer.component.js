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
var MixerComponent = (function () {
    function MixerComponent(audioContext) {
        this.numberOfInputs = 4;
        this.audioContext = audioContext;
        this.inputNodes = new Array(this.numberOfInputs);
        this.outputNode = this.audioContext.context().createGain();
        this.outputNode.gain.value = 1.0;
        //TODO: make this settable. Doesn't need it for the synth, but will make it easier to reuse as a real mixer
        for (var i = 0; i < this.numberOfInputs; i++) {
            var newNode = this.audioContext.context().createGain();
            newNode.gain.value = 0.5;
            this.inputNodes[i] = newNode;
        }
    }
    MixerComponent.prototype.inputs = function () {
        return this.inputNodes;
    };
    MixerComponent.prototype.output = function () {
        for (var i = 0; i < this.numberOfInputs; i++) {
            this.inputNodes[i].connect(this.outputNode);
        }
        return this.outputNode;
    };
    return MixerComponent;
}());
MixerComponent = __decorate([
    core_1.Component({
        selector: 'mixer',
        template: "<p>Yo dawg this is a mixer component</p>"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], MixerComponent);
exports.MixerComponent = MixerComponent;
//# sourceMappingURL=mixer.component.js.map