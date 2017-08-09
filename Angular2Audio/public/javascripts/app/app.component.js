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
var input_service_1 = require("./services/input.service");
var AppComponent = (function () {
    function AppComponent(inputService) {
        var _this = this;
        this.attack = 0.5;
        this.release = 0.5;
        this.portamento = 0.05;
        this.name = 'Angular';
        this.frequencyFromNoteNumber = function (note) {
            return 440 * Math.pow(2, (note - 69) / 12);
        };
        this.velocityToGain = function (velocity) {
            return velocity / 127.0;
        };
        this.noteOn = function (number) {
            _this.oscillator.frequency.cancelScheduledValues(0);
            _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(number), 0, _this.portamento);
        };
        this.velocityOn = function (velocity) {
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setTargetAtTime(_this.velocityToGain(velocity), 0, _this.attack);
        };
        this.noteOff = function (number) {
            _this.oscillator.frequency.cancelScheduledValues(0);
            _this.oscillator.frequency.setTargetAtTime(_this.frequencyFromNoteNumber(number), 0, _this.portamento);
        };
        this.velocityOff = function () {
            _this.envelope.gain.cancelScheduledValues(0);
            _this.envelope.gain.setTargetAtTime(0.0, 0, _this.release);
        };
        this.inputService = inputService;
        this.inputService.noteOn$.subscribe(function (number) {
            _this.noteOn(number);
        });
        this.inputService.velocityOn$.subscribe(function (velocity) {
            _this.velocityOn(velocity);
        });
        this.inputService.noteOff$.subscribe(function (number) {
            _this.noteOff(number);
        });
        this.inputService.velocityOff$.subscribe(function () {
            _this.velocityOff();
        });
    }
    AppComponent.prototype.ngOnInit = function () {
        this.audioContext = new AudioContext();
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = 'sawtooth';
        this.envelope = this.audioContext.createGain();
        this.oscillator.connect(this.envelope);
        this.envelope.connect(this.audioContext.destination);
        this.envelope.gain.value = 0.0;
        this.oscillator.start();
    };
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        template: "<h1>Hello {{name}}</h1>"
    }),
    __metadata("design:paramtypes", [input_service_1.InputService])
], AppComponent);
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map