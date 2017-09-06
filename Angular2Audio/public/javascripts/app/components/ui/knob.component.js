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
var KnobComponent = /** @class */ (function () {
    function KnobComponent() {
        this.meterRotation = 0;
        this.tempMeterRotation = 0;
        this.startX = 0;
        this.startY = 0;
        this.maxDistance = 0;
        this.min = 0;
        this.max = 100;
        this.meterValue = 50;
        this.startDegree = 200;
        this.endDegree = 120;
        this.intensive = true;
        this.label = 'label';
        this.change = new core_1.EventEmitter(false);
        this.maxDistance = document.body.clientHeight;
        if (document.body.clientWidth > this.maxDistance) {
            this.maxDistance = document.body.clientWidth;
        }
        this.maxDistance = Math.round((this.maxDistance * 10) / 100);
    }
    KnobComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        this.knobDiv.nativeElement.addEventListener('mousedown', function (e) { _this.setChangeListener(e); });
        this.knobDiv.nativeElement.addEventListener('touchstart', function (e) { _this.setChangeListener(e); });
        this.calculateInitialValue();
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
    KnobComponent.prototype.setInitialValue = function (value) {
        this.meterValue = value;
        this.calculateInitialValue();
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
        this.meterValue = (100 * newValue) / maxDegrees;
        var norm = this.max - this.min;
        this.meterValue = Math.round(((norm * this.meterValue) / 100) + this.min);
        if (this.intensive) {
            this.change.emit(this.meterValue);
        }
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
                _this.change.emit(_this.meterValue);
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
    KnobComponent.prototype.calculateInitialValue = function () {
        var norm = this.meterValue - this.min;
        var percent = norm * 100 / (this.max - this.min);
        var maxdeg = this.getMaxDegrees();
        var rot = percent * maxdeg / 100;
        this.meterRotation = rot % 360;
        rot = rot + this.startDegree;
        this.knobDiv.nativeElement.style.transform = "rotate(" + rot + "deg)";
    };
    __decorate([
        core_1.Input('label'),
        __metadata("design:type", String)
    ], KnobComponent.prototype, "label", void 0);
    __decorate([
        core_1.Output('change'),
        __metadata("design:type", core_1.EventEmitter)
    ], KnobComponent.prototype, "change", void 0);
    __decorate([
        core_1.ViewChild('knob'),
        __metadata("design:type", core_1.ElementRef)
    ], KnobComponent.prototype, "knobDiv", void 0);
    KnobComponent = __decorate([
        core_1.Component({
            selector: 'knob',
            template: "\n<div class=\"knob-background\">\n    <div #knob class=\"knob-handle\"></div>\n</div>\n<label class=\"knob-label\">{{label}}</label>\n<label class=\"knob-label\">{{meterValue | number:'1.0-0'}}%</label>\n",
            styles: ["\n.knob-background{\n    background:url('/skins/skin1_back.svg');    \n    background-size: contain;\n    background-repeat: no-repeat;\n    width: 30px;\n    height: 30px;\n    display: inline-block;\n}\n.knob-handle{\n    background:url('/skins/skin1_front.svg');\n    background-size: contain;    \n    background-repeat: no-repeat;\n    width: 100%;\n    height: 100%;\n    cursor:pointer;\n}\n.knob-label{\n    font-size: 10px;\n    display: block;\n}\n"]
        }),
        __metadata("design:paramtypes", [])
    ], KnobComponent);
    return KnobComponent;
}());
exports.KnobComponent = KnobComponent;
//# sourceMappingURL=knob.component.js.map