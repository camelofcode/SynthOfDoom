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
var NoiseComponent = (function () {
    //https://noisehack.com/generate-noise-web-audio-api/
    function NoiseComponent(audioContext) {
        this.audioContext = audioContext;
        var context = this.audioContext.context();
        var bufferSize = 2 * context.sampleRate;
        var noiseBuffer = context.createBuffer(1, bufferSize, context.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        for (var i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        this.noiseGenerator = context.createBufferSource();
        this.noiseGenerator.buffer = noiseBuffer;
        this.noiseGenerator.loop = true;
        this.noiseGenerator.start(0);
    }
    NoiseComponent.prototype.node = function () {
        return this.noiseGenerator;
    };
    NoiseComponent.prototype.updateColor = function (type) {
        //TODO: this;
    };
    return NoiseComponent;
}());
NoiseComponent = __decorate([
    core_1.Component({
        selector: 'noise',
        template: "<h4>Noise</h4>\n<div><label>Color</label><br/>\n    <select (change)=\"updateColor($event.target.value)\">\n        <option value=\"white\" selected>White</option>\n        <option value=\"pink\">Pink</option>    \n        <option value=\"brown\">Brown</option>\n    </select>\n</div>"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], NoiseComponent);
exports.NoiseComponent = NoiseComponent;
//# sourceMappingURL=noise.component.js.map