"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var input_service_1 = require("./services/input.service");
var midi_input_service_1 = require("./services/midi.input.service");
var keyboard_input_service_1 = require("./services/keyboard.input.service");
var audioContext_service_1 = require("./services/audioContext.service");
var app_component_1 = require("./app.component");
var envelope_component_1 = require("./components/envelope.component");
var oscillator_component_1 = require("./components/oscillator.component");
var biquadfilter_component_1 = require("./components/biquadfilter.component");
var noise_component_1 = require("./components/noise.component");
var mixer_component_1 = require("./components/mixer.component");
var knob_component_1 = require("./components/ui/knob.component");
var AppModule = (function () {
    function AppModule() {
    }
    return AppModule;
}());
AppModule = __decorate([
    core_1.NgModule({
        imports: [platform_browser_1.BrowserModule],
        declarations: [app_component_1.AppComponent, envelope_component_1.EnvelopeComponent, oscillator_component_1.OscillatorComponent, biquadfilter_component_1.BiquadFilterComponent, noise_component_1.NoiseComponent, mixer_component_1.MixerComponent, knob_component_1.KnobComponent],
        bootstrap: [app_component_1.AppComponent],
        providers: [input_service_1.InputService, midi_input_service_1.MidiInputService, keyboard_input_service_1.KeyboardInputService, audioContext_service_1.AudioContextService]
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map