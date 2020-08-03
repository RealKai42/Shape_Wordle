"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.preProcessImg = void 0;
var opencv4nodejs_1 = __importStar(require("opencv4nodejs"));
var helper_1 = require("./helper");
var visTools_1 = require("./visTools");
function preProcessImg(image, options) {
    var cuttedImage = cutImage(image, options);
    var groupData = getGroup(cuttedImage);
    visTools_1.groupVis(groupData, options, "test");
}
exports.preProcessImg = preProcessImg;
/**
 * 使用watershed算法进行分区
 * @param image
 * @param Options
 */
function getGroup(image) {
    var gray = image.cvtColor(opencv4nodejs_1.default.COLOR_BGR2GRAY);
    var thresh = gray.threshold(0, 255, opencv4nodejs_1.default.THRESH_BINARY_INV + opencv4nodejs_1.default.THRESH_OTSU);
    var components = thresh.connectedComponents();
    return components.getDataAsArray();
}
/**
 * 将透明背景处理为白色，裁剪输入图片到目标大小
 * @param image
 * @param options
 */
function cutImage(image, options) {
    var height = image.sizes[0], width = image.sizes[1];
    var canvasWidth = options.width, canvasHeight = options.height;
    var timer = new helper_1.Timer();
    timer.tick("1");
    if (image.channels === 4) {
        var _a = image.splitChannels(), alpha = _a[3];
        var mask = alpha.threshold(254, 255, opencv4nodejs_1.default.THRESH_BINARY).bitwiseNot();
        image = image.setTo(new opencv4nodejs_1.Vec4(255, 255, 255, 1), mask).cvtColor(opencv4nodejs_1.default.COLOR_BGRA2BGR);
    }
    timer.tick("2");
    // 使用灰度图对图片进行切割
    var gray = image.cvtColor(opencv4nodejs_1.default.COLOR_BGR2GRAY);
    var top = 0;
    var bottom = 0;
    var left = 0;
    var right = 0;
    var threshold = 250;
    cutAnchor1: for (var row = 0; row < height; row++) {
        for (var col = 0; col < width; col++) {
            if (gray.at(row, col) <= threshold) {
                top = row;
                break cutAnchor1;
            }
        }
    }
    cutAnchor2: for (var col = 0; col < width; col++) {
        for (var row = 0; row < height; row++) {
            if (gray.at(row, col) <= threshold) {
                left = col;
                break cutAnchor2;
            }
        }
    }
    cutAnchor3: for (var col = width - 1; col >= 0; col--) {
        for (var row = 0; row < height; row++) {
            if (gray.at(row, col) <= threshold) {
                right = col;
                break cutAnchor3;
            }
        }
    }
    cutAnchor4: for (var row = height - 1; row >= 0; row--) {
        for (var col = 0; col < width; col++) {
            if (gray.at(row, col) <= threshold) {
                bottom = row;
                break cutAnchor4;
            }
        }
    }
    timer.tick("3");
    image = image.getRegion(new opencv4nodejs_1.default.Rect(left, top, right - left, bottom - top));
    height = image.sizes[0];
    width = image.sizes[1];
    // 确定缩放的scale
    var ratio = 0.9; // 图片占canvas的比例
    var scale = (canvasWidth * ratio) / width;
    if (height * scale > canvasHeight * ratio) {
        scale = (canvasHeight * ratio) / height;
    }
    height = Math.floor(height * scale);
    width = Math.floor(width * scale);
    image = image.resize(height, width);
    timer.tick("4");
    // 转换到目标宽高
    var newImage = new opencv4nodejs_1.default.Mat(canvasHeight, canvasWidth, opencv4nodejs_1.default.CV_8UC3, [255, 255, 255]);
    var startRow = Math.floor((canvasHeight - height) / 2);
    var startCol = Math.floor((canvasWidth - width) / 2);
    image.copyTo(newImage.getRegion(new opencv4nodejs_1.default.Rect(startCol, startRow, width, height)));
    timer.tick("5");
    return newImage;
}
