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
var audioContext_service_1 = require("./services/audioContext.service");
var AppComponent = (function () {
    function AppComponent(audioContextService) {
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }
    AppComponent.prototype.ngOnInit = function () {
        this.oscillator1.node().connect(this.mixer.inputs()[0]);
        this.oscillator2.node().connect(this.mixer.inputs()[1]);
        this.oscillator3.node().connect(this.mixer.inputs()[2]);
        this.mixer.output().connect(this.envelope.node());
        this.envelope.node().connect(this.filter.node());
        this.filter.node().connect(this.audioContext.destination);
    };
    return AppComponent;
}());
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
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "<oscillator class=\"section\" #oscillator1></oscillator><oscillator class=\"section\" #oscillator2></oscillator><oscillator class=\"section\" #oscillator3></oscillator><mixer class=\"section\" #mixer></mixer><envelope class=\"section\" #envelope></envelope><biquad-filter class=\"section\" #filter></biquad-filter>",
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map