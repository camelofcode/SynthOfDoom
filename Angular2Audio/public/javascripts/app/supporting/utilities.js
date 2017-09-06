"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utilities = /** @class */ (function () {
    function Utilities() {
    }
    Utilities.scaleFromPercent = function (value, lower, upper) {
        return ((upper - lower) * (value / 100.0)) + lower;
    };
    Utilities.scaleToPercent = function (value, lower, upper) {
        return ((value - lower) / (upper - lower)) * 100.0;
    };
    return Utilities;
}());
exports.default = Utilities;
//# sourceMappingURL=utilities.js.map