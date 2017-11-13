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
var input_service_1 = require("../services/input.service");
var lfoTarget_service_1 = require("../services/lfoTarget.service");
var knob_component_1 = require("./ui/knob.component");
var lfoTarget_1 = require("../models/lfoTarget");
var BiquadFilterComponent = /** @class */ (function () {
    function BiquadFilterComponent(audioContextService, inputService, lfoTargetService) {
        var _this = this;
        this.showQ = true;
        this.showGain = false;
        this.frequency = 1000;
        this.depth = 0.0;
        this.attack = 0.5;
        this.decay = 0.5;
        this.sustain = 0.5;
        this.release = 0.5;
        this.minFrequency = 60;
        this.maxFrequency = 10000;
        this.minQ = 1;
        this.maxQ = 16;
        this.minGain = -24;
        this.maxGain = 24;
        this.minDepth = -1;
        this.maxDepth = 1;
        this.minAttack = 0;
        this.maxAttack = 2;
        this.minDecay = 0;
        this.maxDecay = 2;
        this.minSustain = 0;
        this.maxSustain = 1;
        this.minRelease = 0;
        this.maxRelease = 2;
        this.name = 'Oscillator';
        this.velocityToGain = function (velocity) {
            return velocity / 127.0;
        };
        this.velocityOn = function () {
            var time = _this.audioContext.currentTime;
            _this.filter.frequency.cancelScheduledValues(0);
            _this.filter.frequency.setValueAtTime(_this.frequency, 0);
            var depthPercent = Math.abs(_this.depth) * 100;
            var attackTarget;
            var decayTarget;
            if (_this.depth === 0) {
                return;
            }
            else if (_this.depth > 0) {
                attackTarget = _this.scaleFromPercent(depthPercent, _this.frequency, _this.maxFrequency);
                decayTarget = _this.scaleFromPercent(depthPercent * _this.sustain, _this.frequency, _this.maxFrequency);
            }
            else {
                attackTarget = _this.scaleFromPercent(depthPercent, _this.frequency, _this.minFrequency);
                decayTarget = _this.scaleFromPercent(depthPercent * _this.sustain, _this.frequency, _this.minFrequency);
            }
            _this.filter.frequency.linearRampToValueAtTime(attackTarget, time + _this.attack);
            _this.filter.frequency.linearRampToValueAtTime(decayTarget, time + _this.attack + _this.decay);
        };
        this.velocityOff = function () {
            var time = _this.audioContext.currentTime;
            _this.filter.frequency.cancelScheduledValues(0);
            _this.filter.frequency.linearRampToValueAtTime(_this.frequency, time + _this.release);
        };
        this.audioContext = audioContextService.context();
        this.inputService = inputService;
        this.lfoTargetService = lfoTargetService;
        this.inputService.velocityOn$.subscribe(function (velocity) {
            _this.velocityOn();
        });
        this.inputService.velocityOff$.subscribe(function () {
            _this.velocityOff();
        });
        this.filter = this.audioContext.createBiquadFilter();
        this.filter.frequency.value = 1000;
        this.filter.Q.value = 2;
    }
    BiquadFilterComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.knobFrequency.init(this.minFrequency, this.maxFrequency, this.filter.frequency.value, function (value) {
            _this.frequency = value;
            _this.filter.frequency.setValueAtTime(_this.frequency, 0);
        });
        this.knobQ.init(this.minQ, this.maxQ, this.filter.Q.value, function (value) {
            _this.filter.Q.setValueAtTime(value, 0);
        });
        this.knobDepth.init(this.minDepth, this.maxDepth, this.depth, function (value) {
            _this.depth = value;
        });
        this.knobAttack.init(this.minAttack, this.maxAttack, this.attack, function (value) {
            _this.attack = value;
        });
        this.knobDecay.init(this.minDecay, this.maxDecay, this.decay, function (value) {
            _this.decay = value;
        });
        this.knobSustain.init(this.minSustain, this.maxSustain, this.sustain, function (value) {
            _this.sustain = value;
        });
        this.knobRelease.init(this.minRelease, this.maxRelease, this.release, function (value) {
            _this.sustain = value;
        });
    };
    BiquadFilterComponent.prototype.node = function () {
        return this.filter;
    };
    BiquadFilterComponent.prototype.registerTargets = function (componentName) {
        var id = componentName.toLowerCase().replace(' ', '') + 'Cutoff';
        var name = componentName + ' Cutoff';
        this.lfoTargetService.registerTarget(new lfoTarget_1.LfoTarget(id, name, 20, 5000, this.filter.frequency));
    };
    BiquadFilterComponent.prototype.updateType = function (type) {
        var _this = this;
        this.filter.type = type;
        switch (type) {
            case 'lowpass':
            case 'highpass':
            case 'bandpass':
            case 'notch':
            case 'allpass':
                {
                    this.showGain = false;
                    this.showQ = true;
                    this.filter.gain.setValueAtTime(0, 0);
                    this.knobGain.init(this.minGain, this.maxGain, this.filter.gain.value, function (value) {
                        _this.filter.gain.setValueAtTime(value, 0);
                    });
                    return;
                }
            case 'lowshelf':
            case 'highshelf':
                {
                    this.showGain = true;
                    this.showQ = false;
                    this.filter.Q.setValueAtTime(2, 0);
                    this.knobGain.init(this.minGain, this.maxGain, this.filter.gain.value, function (value) {
                        _this.filter.gain.setValueAtTime(value, 0);
                    });
                    return;
                }
            case 'peaking':
                {
                    this.showGain = true;
                    this.showQ = true;
                    return;
                }
        }
    };
    BiquadFilterComponent.prototype.scaleFromPercent = function (value, lower, upper) {
        return ((upper - lower) * (value / 100.0)) + lower;
    };
    __decorate([
        core_1.Input('name'),
        __metadata("design:type", String)
    ], BiquadFilterComponent.prototype, "name", void 0);
    __decorate([
        core_1.ViewChild('knobFrequency'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobFrequency", void 0);
    __decorate([
        core_1.ViewChild('knobQ'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobQ", void 0);
    __decorate([
        core_1.ViewChild('knobGain'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobGain", void 0);
    __decorate([
        core_1.ViewChild('knobDepth'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobDepth", void 0);
    __decorate([
        core_1.ViewChild('knobAttack'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobAttack", void 0);
    __decorate([
        core_1.ViewChild('knobDecay'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobDecay", void 0);
    __decorate([
        core_1.ViewChild('knobSustain'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobSustain", void 0);
    __decorate([
        core_1.ViewChild('knobRelease'),
        __metadata("design:type", knob_component_1.KnobComponent)
    ], BiquadFilterComponent.prototype, "knobRelease", void 0);
    BiquadFilterComponent = __decorate([
        core_1.Component({
            selector: 'biquad-filter',
            template: "<h4>{{name}}</h4>\n<div><label>Type</label><br/>\n    <select (change)=\"updateType($event.target.value)\">\n        <option value=\"lowpass\" selected>Low Pass</option>\n        <option value=\"highpass\">High Pass</option>    \n        <option value=\"bandpass\">Band Pass</option>\n        <option value=\"lowshelf\">Low Shelf</option>\n        <option value=\"highshelf\">High Shelf</option>\n        <option value=\"peaking\">Peaking</option>\n        <option value=\"notch\">Notch</option>\n        <option value=\"allpass\">All Pass</option>\n    </select>\n</div>\n<knob #knobFrequency label=\"Cut Off\"  unit=\"Hz\"></knob>\n<knob #knobQ label=\"Resonance\" [class.hide]=\"!showQ\"  unit=\"\"></knob>\n<knob #knobGain label=\"Gain\" [class.hide]=\"!showGain\"  unit=\"\"></knob>\n<knob #knobDepth label=\"Env. Depth\"  unit=\"\"></knob>\n<knob #knobAttack label=\"Env. Attack\"  unit=\"s\"></knob>\n<knob #knobDecay label=\"Env. Decay\"  unit=\"s\"></knob>\n<knob #knobSustain label=\"Env. Sustain\"  unit=\"s\"></knob>\n<knob #knobRelease label=\"Env. Release\"  unit=\"s\"></knob>\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService, input_service_1.InputService, lfoTarget_service_1.LfoTargetService])
    ], BiquadFilterComponent);
    return BiquadFilterComponent;
}());
exports.BiquadFilterComponent = BiquadFilterComponent;
//# sourceMappingURL=biquadfilter.component.js.map