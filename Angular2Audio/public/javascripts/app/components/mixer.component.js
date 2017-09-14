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
var utilities_1 = require("../supporting/utilities");
var MixerComponent = /** @class */ (function () {
    function MixerComponent(changeDetector, audioContextService) {
        this.changeDetector = changeDetector;
        this.minGain = 0;
        this.maxGain = 1;
        this.audioContext = audioContextService.context();
        this.inputNodes = new Array();
        this.output1ChannelGains = new Array();
        this.output2ChannelGains = new Array();
        this.labels = new Array();
        this.outputNode1 = this.audioContext.createGain();
        this.outputNode1.gain.value = 1.0;
        this.outputNode2 = this.audioContext.createGain();
        this.outputNode2.gain.value = 1.0;
    }
    MixerComponent.prototype.ngAfterViewInit = function () {
        for (var i = 0; i < this.inputNodes.length; i++) {
            this.gainKnobs.toArray()[i].setInitialValue(utilities_1.default.scaleToPercent(this.inputNodes[i].gain.value, this.minGain, this.maxGain));
            this.gainKnobs.toArray()[i].label = this.labels[i];
            this.filterKnobs.toArray()[i].setInitialValue(utilities_1.default.scaleToPercent(this.output2ChannelGains[i].gain.value, this.minGain, this.maxGain));
            this.switches.toArray()[i].nativeElement.checked = true;
            this.changeDetector.detectChanges();
        }
    };
    MixerComponent.prototype.addChannel = function (node, label) {
        var newNode = this.audioContext.createGain();
        newNode.gain.value = 0.8;
        node.connect(newNode);
        this.inputNodes.push(newNode);
        var output1ChannelGain = this.audioContext.createGain();
        var output2ChannelGain = this.audioContext.createGain();
        output1ChannelGain.gain.value = 0.5;
        output2ChannelGain.gain.value = 0.5;
        newNode.connect(output1ChannelGain);
        newNode.connect(output2ChannelGain);
        this.output1ChannelGains.push(output1ChannelGain);
        this.output2ChannelGains.push(output2ChannelGain);
        this.labels.push(label);
    };
    MixerComponent.prototype.output1 = function () {
        for (var i = 0; i < this.inputNodes.length; i++) {
            this.output1ChannelGains[i].connect(this.outputNode1);
        }
        return this.outputNode1;
    };
    MixerComponent.prototype.output2 = function () {
        for (var i = 0; i < this.inputNodes.length; i++) {
            this.output2ChannelGains[i].connect(this.outputNode2);
        }
        return this.outputNode2;
    };
    MixerComponent.prototype.updateChannelGain = function (value, target) {
        this.inputNodes[target].gain.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    };
    MixerComponent.prototype.updateChannelFilter = function (value, target) {
        this.output1ChannelGains[target].gain.setValueAtTime(utilities_1.default.scaleFromPercent(100 - value, this.minGain, this.maxGain), 0);
        this.output2ChannelGains[target].gain.setValueAtTime(utilities_1.default.scaleFromPercent(value, this.minGain, this.maxGain), 0);
    };
    MixerComponent.prototype.updateChannelOn = function (event, target) {
        if (event.target.checked) {
            this.inputNodes[target].connect(this.output1ChannelGains[target]);
            this.inputNodes[target].connect(this.output2ChannelGains[target]);
        }
        else {
            this.inputNodes[target].disconnect(this.output1ChannelGains[target]);
            this.inputNodes[target].disconnect(this.output2ChannelGains[target]);
        }
    };
    __decorate([
        core_1.ViewChildren('gainKnobs'),
        __metadata("design:type", core_1.QueryList)
    ], MixerComponent.prototype, "gainKnobs", void 0);
    __decorate([
        core_1.ViewChildren('filterKnobs'),
        __metadata("design:type", core_1.QueryList)
    ], MixerComponent.prototype, "filterKnobs", void 0);
    __decorate([
        core_1.ViewChildren('switches'),
        __metadata("design:type", core_1.QueryList)
    ], MixerComponent.prototype, "switches", void 0);
    MixerComponent = __decorate([
        core_1.Component({
            selector: 'mixer',
            template: "<h4>Mixer</h4>\n<ng-template ngFor let-item [ngForOf]=\"inputNodes\" let-currentIndex=\"index + 1\" let-i=\"index\">\n    <knob #gainKnobs (change)=\"updateChannelGain($event, i)\"></knob>\n    <knob #filterKnobs label=\"Filter 1/2 Mix\" (change)=\"updateChannelFilter($event, i)\"></knob>\n    <input #switches type=\"checkbox\" (change)=\"updateChannelOn($event, i)\"/>\n</ng-template>\n"
        }),
        __metadata("design:paramtypes", [core_1.ChangeDetectorRef, audioContext_service_1.AudioContextService])
    ], MixerComponent);
    return MixerComponent;
}());
exports.MixerComponent = MixerComponent;
//# sourceMappingURL=mixer.component.js.map