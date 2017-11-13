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
var controlChange_service_1 = require("../../services/controlChange.service");
var MidiLearnComponent = /** @class */ (function () {
    function MidiLearnComponent(controlChangeService, changeDetector) {
        var _this = this;
        this.targets = new Array();
        this.learning = false;
        this.controlChangeService = controlChangeService;
        this.changeDetector = changeDetector;
        this.controlChangeService.learningStopped$.subscribe(function () {
            _this.learning = false;
            _this.changeDetector.detectChanges();
        });
    }
    MidiLearnComponent.prototype.startLearn = function (id) {
        this.learning = true;
        this.changeDetector.detectChanges();
        this.controlChangeService.beginLearn(this.targets.find(function (target) { return target.id === id; }));
    };
    MidiLearnComponent.prototype.cancelLearn = function () {
        this.controlChangeService.cancelLearn();
    };
    MidiLearnComponent.prototype.loadTargets = function () {
        this.targets = new Array();
        var targets = this.controlChangeService.getTargets();
        for (var i = 0; i < targets.length; i++) {
            this.targets.push(targets[i]);
        }
    };
    MidiLearnComponent = __decorate([
        core_1.Component({
            selector: 'midi-learn',
            template: "<div><label>Midi Learn Target</label>\n    <select #selectedTarget>\n        <option *ngFor=\"let target of targets\" value=\"{{target.id}}\">{{target.displayName}}</option>  \n    </select>\n<button (click)=\"startLearn(selectedTarget.value)\" *ngIf=\"!learning\">Learn</button>\n<button (click)=\"cancelLearn()\" *ngIf=\"learning\">Cancel</button>\n</div>\n"
        }),
        __metadata("design:paramtypes", [controlChange_service_1.ControlChangeService, core_1.ChangeDetectorRef])
    ], MidiLearnComponent);
    return MidiLearnComponent;
}());
exports.MidiLearnComponent = MidiLearnComponent;
//# sourceMappingURL=midilearn.component.js.map