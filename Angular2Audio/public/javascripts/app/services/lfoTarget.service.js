"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var lfoConnectionResponse_1 = require("../models/lfoConnectionResponse");
var LfoTargetService = /** @class */ (function () {
    function LfoTargetService() {
        var _this = this;
        this.targets = new Array();
        this.getTargetById = function (id) {
            for (var i = 0; i < _this.targets.length; i++) {
                if (_this.targets[i].id === id) {
                    return _this.targets[i];
                }
            }
            return null;
        };
    }
    LfoTargetService.prototype.registerTarget = function (target) {
        if (!this.getTargetById(target.id)) {
            this.targets.push(target);
        }
    };
    LfoTargetService.prototype.getTargets = function () {
        return this.targets;
    };
    LfoTargetService.prototype.connectTarget = function (request) {
        var target = this.getTargetById(request.id);
        request.lfo.connect(target.parameter);
        return new lfoConnectionResponse_1.LfoConnectionResponse(target.minAmplitude, target.maxAmplitude);
    };
    LfoTargetService.prototype.disconnectTarget = function (request) {
        var target = this.getTargetById(request.id);
        request.lfo.disconnect(target.parameter);
    };
    LfoTargetService = __decorate([
        core_1.Injectable()
    ], LfoTargetService);
    return LfoTargetService;
}());
exports.LfoTargetService = LfoTargetService;
//# sourceMappingURL=lfoTarget.service.js.map