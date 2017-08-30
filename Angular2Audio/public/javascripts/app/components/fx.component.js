"use strict";
var utilities_1 = require("../supporting/utilities");
var FxComponent = (function () {
    function FxComponent(audioContextService) {
        this.audioContextService = audioContextService;
        this.context = audioContextService.context();
        this.fxChainStart = this.context.createGain();
        this.fxChainEnd = this.context.createGain();
        this.inNode = this.context.createGain();
        this.dry = this.context.createGain();
        this.wet = this.context.createGain();
        this.output = this.context.createGain();
        this.inNode.connect(this.output);
        this.inNode.connect(this.dry);
        this.fxChainEnd.connect(this.wet);
        this.wet.connect(this.output);
    }
    FxComponent.prototype.node = function () {
        return this.output;
    };
    FxComponent.prototype.input = function () { return this.inNode; };
    FxComponent.prototype.connectFxChain = function (start, end) {
        this.fxChainStart.connect(start);
        end.connect(this.fxChainEnd);
    };
    FxComponent.prototype.updateMix = function (value) {
        var scaled = utilities_1.default.scaleFromPercent(value, 0, 1);
        this.wet.gain.setValueAtTime(scaled, 0);
        this.dry.gain.setValueAtTime(1.0 - scaled, 0);
    };
    FxComponent.prototype.updateOn = function (event) {
        if (event.target.checked) {
            this.inNode.disconnect(this.output);
            this.inNode.connect(this.fxChainStart);
            this.dry.connect(this.output);
        }
        else {
            this.inNode.connect(this.output);
            this.inNode.disconnect(this.fxChainStart);
            this.dry.disconnect(this.output);
        }
    };
    return FxComponent;
}());
exports.FxComponent = FxComponent;
//# sourceMappingURL=fx.component.js.map