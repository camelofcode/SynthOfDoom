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
var AppComponent = (function () {
    function AppComponent(audioContextService) {
        this.name = 'Angular';
        this.audioContextService = audioContextService;
        this.audioContext = this.audioContextService.context();
    }
    AppComponent.prototype.ngOnInit = function () {
        this.oscillator1.node().connect(this.envelope1.node());
        this.envelope1.node().connect(this.filter.node());
        this.filter.node().connect(this.audioContext.destination);
    };
    return AppComponent;
}());
__decorate([
    core_1.ViewChild('oscillator1'),
    __metadata("design:type", Object)
], AppComponent.prototype, "oscillator1", void 0);
__decorate([
    core_1.ViewChild('envelope1'),
    __metadata("design:type", Object)
], AppComponent.prototype, "envelope1", void 0);
__decorate([
    core_1.ViewChild('filter1'),
    __metadata("design:type", Object)
], AppComponent.prototype, "filter", void 0);
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "<h1>Hello {{name}}</h1><oscillator #oscillator1></oscillator><envelope #envelope1></envelope><biquad-filter #filter1></biquad-filter>"
    }),
    __metadata("design:paramtypes", [audioContext_service_1.AudioContextService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map