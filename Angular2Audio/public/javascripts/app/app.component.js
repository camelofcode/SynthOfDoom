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
var audioContext_service_1 = require("./services/audioContext.service");
var fx_component_1 = require("./components/fx.component");
var lfo_component_1 = require("./components/lfo.component");
var AppComponent = /** @class */ (function () {
    function AppComponent(audioContextService) {
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }
    AppComponent.prototype.ngOnInit = function () {
        this.mixer.addChannel(this.oscillator1.node(), 'Oscillator 1');
        this.mixer.addChannel(this.oscillator2.node(), 'Oscillator 2');
        this.mixer.addChannel(this.oscillator3.node(), 'Oscillator 3');
        this.mixer.addChannel(this.noise.node(), 'Noise');
        this.mixer.output().connect(this.envelope.node());
        this.envelope.node().connect(this.filter.node());
        this.filter.node().connect(this.delay.input());
        this.delay.node().connect(this.audioContext.destination);
        this.filter.registerTargets('Filter');
        this.oscillator1.registerTargets('Oscillator 1');
        this.oscillator2.registerTargets('Oscillator 2');
        this.oscillator3.registerTargets('Oscillator 3');
        this.lfo1.loadTargets();
        this.lfo2.loadTargets();
        this.lfo3.loadTargets();
    };
    __decorate([
        core_1.ViewChild('oscillator1'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "oscillator1", void 0);
    __decorate([
        core_1.ViewChild('oscillator2'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "oscillator2", void 0);
    __decorate([
        core_1.ViewChild('oscillator3'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "oscillator3", void 0);
    __decorate([
        core_1.ViewChild('noise'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "noise", void 0);
    __decorate([
        core_1.ViewChild('envelope'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "envelope", void 0);
    __decorate([
        core_1.ViewChild('filter'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "filter", void 0);
    __decorate([
        core_1.ViewChild('mixer'),
        __metadata("design:type", Object)
    ], AppComponent.prototype, "mixer", void 0);
    __decorate([
        core_1.ViewChild('delay'),
        __metadata("design:type", fx_component_1.FxComponent)
    ], AppComponent.prototype, "delay", void 0);
    __decorate([
        core_1.ViewChild('lfo1'),
        __metadata("design:type", lfo_component_1.LfoComponent)
    ], AppComponent.prototype, "lfo1", void 0);
    __decorate([
        core_1.ViewChild('lfo2'),
        __metadata("design:type", lfo_component_1.LfoComponent)
    ], AppComponent.prototype, "lfo2", void 0);
    __decorate([
        core_1.ViewChild('lfo3'),
        __metadata("design:type", lfo_component_1.LfoComponent)
    ], AppComponent.prototype, "lfo3", void 0);
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            template: "\n<oscillator name=\"Oscillator 1\" class=\"section\" #oscillator1></oscillator>\n<oscillator name=\"Oscillator 2\" class=\"section\" #oscillator2></oscillator>\n<oscillator name=\"Oscillator 3\" class=\"section\" #oscillator3></oscillator>\n<noise class=\"section\" #noise></noise>\n<mixer class=\"section\" #mixer></mixer>\n<envelope class=\"section\" #envelope></envelope>\n<biquad-filter class=\"section\" #filter></biquad-filter>\n<lfo name=\"Lfo 1\" class=\"section\" #lfo1></lfo>\n<lfo name=\"Lfo 2\" class=\"section\" #lfo2></lfo>\n<lfo name=\"Lfo 3\" class=\"section\" #lfo3></lfo>\n<delay class=\"section\" #delay></delay>\n"
        }),
        __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map