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
var NoiseComponent = /** @class */ (function () {
    function NoiseComponent(audioContextService) {
        this.audioContextService = audioContextService;
        this.context = audioContextService.context();
        this.output = this.context.createGain();
        this.output.gain.value = 1.0;
        this.initWhiteNoise();
        this.initPinkNoise();
        this.initBrownNoise();
        this.currentGenerator = this.whiteNoiseSource;
        this.currentGenerator.connect(this.output);
    }
    NoiseComponent.prototype.node = function () {
        return this.output;
    };
    NoiseComponent.prototype.updateColor = function (type) {
        this.currentGenerator.disconnect(this.output);
        switch (type) {
            case 'white':
                {
                    this.currentGenerator = this.whiteNoiseSource;
                    break;
                }
            case 'pink':
                {
                    this.currentGenerator = this.pinkNoiseSource;
                    break;
                }
            case 'brown':
                {
                    this.currentGenerator = this.brownNoiseSource;
                    break;
                }
            default: this.currentGenerator = this.whiteNoiseSource;
        }
        this.currentGenerator.connect(this.output);
    };
    NoiseComponent.prototype.initWhiteNoise = function () {
        this.whiteNoiseSource = this.context.createBufferSource();
        this.initNoise(this.whiteNoiseSource, function (output, bufferSize) {
            //https://noisehack.com/generate-noise-web-audio-api/
            for (var i = 0; i < bufferSize; i++) {
                output[i] = Math.random() * 2 - 1;
            }
        });
    };
    NoiseComponent.prototype.initPinkNoise = function () {
        this.pinkNoiseSource = this.context.createBufferSource();
        this.initNoise(this.pinkNoiseSource, function (output, bufferSize) {
            //http://www.musicdsp.org/files/pink.txt
            var b0, b1, b2, b3, b4, b5, b6;
            b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                output[i] *= 0.11;
                b6 = white * 0.115926;
            }
        });
    };
    NoiseComponent.prototype.initBrownNoise = function () {
        this.brownNoiseSource = this.context.createBufferSource();
        this.initNoise(this.brownNoiseSource, function (output, bufferSize) {
            //https://noisehack.com/generate-noise-web-audio-api/
            var lastOut = 0.0;
            for (var i = 0; i < bufferSize; i++) {
                var white = Math.random() * 2 - 1;
                output[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = output[i];
                output[i] *= 3.5;
            }
        });
    };
    NoiseComponent.prototype.initNoise = function (source, generator) {
        var bufferSize = 2 * this.context.sampleRate;
        var noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
        var output = noiseBuffer.getChannelData(0);
        generator(output, bufferSize);
        source.buffer = noiseBuffer;
        source.loop = true;
        source.start(0);
    };
    NoiseComponent = __decorate([
        core_1.Component({
            selector: 'noise',
            template: "<h4>Noise</h4>\n<div><label>Color</label><br/>\n    <select (change)=\"updateColor($event.target.value)\">\n        <option value=\"white\" selected>White</option>\n        <option value=\"pink\">Pink</option>    \n        <option value=\"brown\">Brown</option>\n    </select>\n</div>"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
    ], NoiseComponent);
    return NoiseComponent;
}());
exports.NoiseComponent = NoiseComponent;
//# sourceMappingURL=noise.component.js.map