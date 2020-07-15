/**
 * 用于测试图片预处理
 */

const { preProcessImg } = require('../lib/imageProcess')
const { groupVis, distanceVis, contourVis } = require('../lib/visTools')
const { defaultOptions } = require('../lib/defaults')
const cv = require('opencv4nodejs')

const fs = require('fs')
const image = cv.imread('6.png');
const { dist, contour, group } = preProcessImg(image, defaultOptions)
distanceVis(dist, defaultOptions, __dirname)
groupVis(group, defaultOptions, __dirname)
contourVis(contour, defaultOptions, __dirname)