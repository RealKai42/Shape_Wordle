"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ShapeWordle = /** @class */ (function () {
    function ShapeWordle(options) {
        if (options === void 0) { options = {}; }
        this.userOptions = options;
    }
    return ShapeWordle;
}());
var opencv4nodejs_1 = __importDefault(require("opencv4nodejs"));
var imageProcess_1 = require("./imageProcess");
var defaults_1 = require("./defaults");
var image_filename = __dirname + "/input3.png";
var image = opencv4nodejs_1.default.imread(image_filename, opencv4nodejs_1.default.IMREAD_UNCHANGED);
imageProcess_1.preProcessImg(image, defaults_1.defaultOptions);
