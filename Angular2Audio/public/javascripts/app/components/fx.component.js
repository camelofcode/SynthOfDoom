"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = require("../supporting/utilities");
var FxComponent = (function () {
    function FxComponent(audioContextService) {
        this.audioContextService = audioContextService;
        this.context = audioContextService.context();
        this.inNode = this.context.createGain();
        this.dry = this.context.createGain();
        this.wet = this.context.createGain();
        this.output = this.context.createGain();
    }
    FxComponent.prototype.node = function () {
        this.inNode.connect(this.dry);
        this.inNode.connect(this.audioNode);
        this.audioNode.connect(this.wet);
        this.wet.connect(this.output);
        this.dry.connect(this.output);
        return this.output;
    };
    FxComponent.prototype.input = function () { return this.inNode; };
    FxComponent.prototype.updateMix = function (value) {
        var scaled = utilities_1.default.scaleFromPercent(value, 0, 1);
        this.wet.gain.setValueAtTime(scaled, 0);
        this.dry.gain.setValueAtTime(1.0 - scaled, 0);
    };
    return FxComponent;
}());
exports.FxComponent = FxComponent;
//# sourceMappingURL=fx.component.js.map