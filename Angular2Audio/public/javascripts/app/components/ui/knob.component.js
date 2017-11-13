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
//Based On https://github.com/spheras/knob
var core_1 = require("@angular/core");
var controlChange_service_1 = require("../../services/controlChange.service");
var KnobComponent = /** @class */ (function () {
    function KnobComponent(controlChangeService, changeDetector) {
        this.meterRotation = 0;
        this.tempMeterRotation = 0;
        this.startX = 0;
        this.startY = 0;
        this.maxDistance = 0;
        this.min = 0;
        this.max = 100;
        this.percentValue = 50;
        this.labelValue = 50;
        this.startDegree = 200;
        this.endDegree = 120;
        this.intensive = true;
        this.label = 'label';
        this.unit = '';
        this.setLabel = function () {
            var value = this.unit === '%' ? this.percentValue : this.scaleFromPercent(this.percentValue, this.loValue, this.hiValue);
            this.labelValue = parseInt(value + "", 10) === value ? value : value.toFixed(2);
            this.changeDetector.detectChanges();
        };
        this.controlChangeService = controlChangeService;
        this.changeDetector = changeDetector;
        this.maxDistance = document.body.clientHeight;
        if (document.body.clientWidth > this.maxDistance) {
            this.maxDistance = document.body.clientWidth;
        }
        this.maxDistance = Math.round((this.maxDistance * 10) / 100);
    }
    KnobComponent.prototype.init = function (component, lo, hi, initial, update) {
        var _this = this;
        this.loValue = lo;
        this.hiValue = hi;
        this.updateFunction = update;
        this.percentValue = this.scaleToPercent(initial, this.loValue, this.hiValue);
        this.calculateInitialValue();
        this.setLabel();
        this.controlChangeService.registerTarget({
            id: component + "" + this.label,
            displayName: component + " " + this.label,
            update: function (value) {
                _this.percentValue = value;
                _this.calculateInitialValue();
                _this.setLabel();
                _this.setValueFromPercent(_this.percentValue);
            }
        });
    };
    KnobComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.knobDiv.nativeElement.addEventListener('mousedown', function (e) { _this.setChangeListener(e); });
        this.knobDiv.nativeElement.addEventListener('touchstart', function (e) { _this.setChangeListener(e); });
        this.setLabel();
    };
    KnobComponent.prototype.getMouseDifference = function (e) {
        var mousepos = this.getMousePosition(e);
        var yMovement = mousepos.clientY - this.startY;
        var xMovement = mousepos.clientX - this.startX;
        return yMovement + xMovement;
    };
    KnobComponent.prototype.getMaxDegrees = function () {
        if (this.endDegree > this.startDegree) {
            return this.endDegree - this.startDegree;
        }
        else if (this.endDegree < this.startDegree) {
            return 360 + this.endDegree - this.startDegree;
        }
        else {
            return 0;
        }
    };
    KnobComponent.prototype.calculateChange = function (mousePositionChange) {
        var maxDegrees = this.getMaxDegrees();
        var newValue = mousePositionChange * maxDegrees / this.maxDistance;
        newValue = (newValue + this.meterRotation);
        if (newValue < 0) {
            newValue = 0;
        }
        else if (newValue > maxDegrees) {
            newValue = maxDegrees;
        }
        this.tempMeterRotation = newValue;
        this.knobDiv.nativeElement.style.transform = "rotate(" + (newValue + this.startDegree) + "deg)";
        this.percentValue = (100 * newValue) / maxDegrees;
        var norm = this.max - this.min;
        this.percentValue = Math.round(((norm * this.percentValue) / 100) + this.min);
        if (this.intensive) {
            this.setValueFromPercent(this.percentValue);
        }
        this.setLabel();
    };
    KnobComponent.prototype.getMousePosition = function (event) {
        var result = { clientX: 0, clientY: 0 };
        if (event.touches) {
            result.clientX = event.touches[0].clientX;
            result.clientY = event.touches[0].clientY;
        }
        else {
            result.clientX = event.clientX;
            result.clientY = event.clientY;
        }
        return result;
    };
    KnobComponent.prototype.setChangeListener = function (e) {
        var _this = this;
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        if (e.preventDefault) {
            e.preventDefault();
        }
        var mousepos = this.getMousePosition(e);
        this.startX = mousepos.clientX;
        this.startY = mousepos.clientY;
        var funcMove = function (e) {
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            var change = _this.getMouseDifference(e);
            _this.calculateChange(change);
        };
        var funcRemove = function (e) {
            if (!_this.intensive) {
                _this.setValueFromPercent(_this.percentValue);
            }
            if (e.stopPropagation) {
                e.stopPropagation();
            }
            if (e.preventDefault) {
                e.preventDefault();
            }
            _this.startX = 0;
            _this.startY = 0;
            _this.meterRotation = _this.tempMeterRotation;
            document.removeEventListener('mousemove', funcMove);
            document.removeEventListener('touchmove', funcMove);
            document.removeEventListener('mouseup', funcRemove);
            document.removeEventListener('touchend', funcRemove);
        };
        document.addEventListener('mousemove', funcMove, false);
        document.addEventListener('touchmove', funcMove, false);
        document.addEventListener('mouseup', funcRemove, false);
        document.addEventListener('touchend', funcRemove, false);
    };
    KnobComponent.prototype.setValueFromPercent = function (value) {
        this.updateFunction(this.scaleFromPercent(value, this.loValue, this.hiValue));
    };
    KnobComponent.prototype.calculateInitialValue = function () {
        var norm = this.percentValue - this.min;
        var percent = norm * 100 / (this.max - this.min);
        var maxdeg = this.getMaxDegrees();
        var rot = percent * maxdeg / 100;
        this.meterRotation = rot % 360;
        rot = rot + this.startDegree;
        this.knobDiv.nativeElement.style.transform = "rotate(" + rot + "deg)";
    };
    KnobComponent.prototype.scaleFromPercent = function (value, lower, upper) {
        return ((upper - lower) * (value / 100.0)) + lower;
    };
    KnobComponent.prototype.scaleToPercent = function (value, lower, upper) {
        return ((value - lower) / (upper - lower)) * 100.0;
    };
    __decorate([
        core_1.Input('label'),
        __metadata("design:type", String)
    ], KnobComponent.prototype, "label", void 0);
    __decorate([
        core_1.Input('unit'),
        __metadata("design:type", String)
    ], KnobComponent.prototype, "unit", void 0);
    __decorate([
        core_1.ViewChild('knob'),
        __metadata("design:type", core_1.ElementRef)
    ], KnobComponent.prototype, "knobDiv", void 0);
    KnobComponent = __decorate([
        core_1.Component({
            selector: 'knob',
            template: "\n<div class=\"knob-background\">\n    <div #knob class=\"knob-handle\"></div>\n</div>\n<label class=\"knob-label\">{{label}}</label>\n<label class=\"knob-label\">{{labelValue}} {{unit}}</label>\n",
            styles: ["\n.knob-background{\n    background:url('/skins/skin1_back.svg');    \n    background-size: contain;\n    background-repeat: no-repeat;\n    width: 30px;\n    height: 30px;\n    display: inline-block;\n}\n.knob-handle{\n    background:url('/skins/skin1_front.svg');\n    background-size: contain;    \n    background-repeat: no-repeat;\n    width: 100%;\n    height: 100%;\n    cursor:pointer;\n}\n.knob-label{\n    font-size: 10px;\n    display: block;\n}\n"]
        }),
        __metadata("design:paramtypes", [controlChange_service_1.ControlChangeService, core_1.ChangeDetectorRef])
    ], KnobComponent);
    return KnobComponent;
}());
exports.KnobComponent = KnobComponent;
//# sourceMappingURL=knob.component.js.map