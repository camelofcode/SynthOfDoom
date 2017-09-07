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
var lfoTarget_service_1 = require("../services/lfoTarget.service");
var audioContext_service_1 = require("../services/audioContext.service");
var knob_component_1 = require("./ui/knob.component");
var lfoTarget_1 = require("../models/lfoTarget");
var lfoConnectionRequest_1 = require("../models/lfoConnectionRequest");
var utilities_1 = require("../supporting/utilities");
var LfoComponent = /** @class */ (function () {
    function LfoComponent(audioContextService, lfoTargetService) {
        this.targets = new Array();
        this.name = 'LFO';
        this.minFrequency = 0.1;
        this.maxFrequency = 20.1;
        this.minAmplitude = 0;
        this.maxAmplitude = 1;
        this.currentTarget = null;
        this.audioContext = audioContextService.context();
        this.lfoTargetService = lfoTargetService;
        this.lfo = this.audioContext.createOscillator();
        this.lfo.frequency.value = 1;
        this.lfo.type = 'sine';
        this.lfo.start();
        this.gain = this.audioContext.createGain();
        this.gain.gain.value = 0.5;
        this.lfo.connect(this.gain);
    }
    LfoComponent.prototype.ngOnInit = function () {
        this.knobFrequecy.setInitialValue(utilities_1.default.scaleToPercent(this.lfo.frequency.value, this.minFrequency, this.maxFrequency));
        this.knobAmplitude.setInitialValue(utilities_1.default.scaleToPercent(this.gain.gain.value, this.minAmplitude, this.maxAmplitude));
    };
    LfoComponent.prototype.loadTargets = function () {
        this.targets = new Array();
        this.targets.push(new lfoTarget_1.LfoTarget('', 'None', 0, 0, null));
        var targets = this.lfoTargetService.getTargets();
        for (var i = 0; i < targets.length; i++) {
            this.targets.push(targets[i]);
        }
    };
    LfoComponent.prototype.updateType = function (type) {
        this.lfo.type = type;
    };
    LfoComponent.prototype.updateTarget = function (targetId) {
        if (this.currentTarget) {
            this.lfoTargetService.disconnectTarget(new lfoConnectionRequest_1.LfoConnectionRequest(this.currentTarget, this.gain));
        }
        if (targetId && targetId !== '') {
            var response = this.lfoTargetService.connectTarget(new lfoConnectionRequest_1.LfoConnectionRequest(targetId, this.gain));
            this.minAmplitude = response.minAmplitude;
            this.maxAmplitude = response.maxAmplitude;
            this.currentTarget = targetId;
        }
        else {
            this.minAmplitude = 0;
            this.maxAmplitude = 1;
            this.currentTarget = null;
        }
        this.gain.gain.value = utilities_1.default.scaleFromPercent(50, this.minAmplitude, this.maxAmplitude);
        this.knobAmplitude.setInitialValue(utilities_1.default.scaleToPercent(this.gain.gain.value, this.minAmplitude, this.maxAmplitude));
    };
    LfoComponent.prototype.updateFrequency = function (value) {
        this.lfo.frequency.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minFrequency, this.maxFrequency), 0);
    };
    LfoComponent.prototype.updateAmplitude = function (value) {
        this.gain.gain.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minAmplitude, this.maxAmplitude), 0);
    };
    __decorate([
        core_1.Input('name'),
        __metadata("design:type", String)
    ], LfoComponent.prototype, "name", void 0);
    __decorate([
        core_1.ViewChild('knobFrequecy'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], LfoComponent.prototype, "knobFrequecy", void 0);
    __decorate([
        core_1.ViewChild('knobAmplitude'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], LfoComponent.prototype, "knobAmplitude", void 0);
    LfoComponent = __decorate([
        core_1.Component({
            selector: 'lfo',
            template: "<h4>{{name}}</h4>\n<div><label>Waveform</label><br/>\n    <select (change)=\"updateType($event.target.value)\">\n        <option value=\"sine\" selected>Sine</option>\n        <option value=\"sawtooth\">Sawtooth</option>    \n        <option value=\"square\">Square</option>\n        <option value=\"triangle\">Triangle</option>\n    </select>\n</div>\n<br/>\n<div><label>Target</label><br/>\n    <select (change)=\"updateTarget($event.target.value)\">\n        <option *ngFor=\"let target of targets\" value=\"{{target.id}}\">{{target.displayName}}</option>  \n    </select>\n</div>\n<br/>\n<div>\n    <knob #knobFrequecy label=\"Rate\" (change)=\"updateFrequency($event)\"></knob>\n    <knob #knobAmplitude label=\"Depth\" (change)=\"updateAmplitude($event)\"></knob>\n\n</div>\n\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, lfoTarget_service_1.LfoTargetService])
    ], LfoComponent);
    return LfoComponent;
}());
exports.LfoComponent = LfoComponent;
//# sourceMappingURL=lfo.component.js.map