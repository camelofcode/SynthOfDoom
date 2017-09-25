"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var PianoComponent = /** @class */ (function () {
    function PianoComponent() {
    }
    PianoComponent = __decorate([
        core_1.Component({
            selector: 'piano',
            template: "\n<div class=\"key white\">\n    <div class=\"key black\"></div>\n</div>\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\"></div>\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\"></div>\n<div class=\"key white\">\n                <div class=\"key black\"></div>\n            </div>\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\"></div>\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\">    \n        <div class=\"key black\"></div>\n    </div>\n\n<div class=\"key white\"></div>\n",
            styles: ["\n.key {\n            outline: 1px solid #777;\n        }\n        .white {\n            position: relative;\n            width: 40px;\n            height: 180px;\n            display: inline-block;\n            margin-right: -3px;\n            background-color: #fff;\n        }\n        .black {\n            position: relative;\n            background-color: #000;\n            width: 24px;\n            height: 100px;\n            margin-left: 28px;\n            z-index: 1;\n        }\n        \n        .highlight {\n            background-color: red;\n        }\n"]
        })
    ], PianoComponent);
    return PianoComponent;
}());
exports.PianoComponent = PianoComponent;
//# sourceMappingURL=piano.component.js.map