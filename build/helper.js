"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = exports.twoDimenArray = void 0;
var twoDimenArray = /** @class */ (function () {
    function twoDimenArray(width, height) {
        this.width = width;
        this.height = height;
        console.log(width, height);
        this.array = new Int8Array(width * height);
    }
    twoDimenArray.prototype.get = function (x, y) {
        return this.array[y * this.width + x];
    };
    twoDimenArray.prototype.set = function (x, y, value) {
        this.array[y * this.width + x] = value;
    };
    twoDimenArray.prototype.toArray = function () {
        var reArray = [];
        for (var y = 0; y < this.height; y++) {
            reArray.push([]);
            for (var x = 0; x < this.width; x++) {
                reArray[y][x] = this.array[y * this.width + x];
            }
        }
        return reArray;
    };
    return twoDimenArray;
}());
exports.twoDimenArray = twoDimenArray;
var Timer = /** @class */ (function () {
    function Timer() {
        this.last = Date.now();
    }
    Timer.prototype.tick = function (msg) {
        console.log(msg + ": " + (Date.now() - this.last));
        this.last = Date.now();
    };
    return Timer;
}());
exports.Timer = Timer;
