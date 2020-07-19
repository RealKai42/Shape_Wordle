const fs = require('fs')
const cv = require('opencv4nodejs')
const { createCanvas, createImageData } = require('canvas')
const { defaultOptions } = require('../lib/defaults')
const { preProcessImg } = require('../lib/imageProcess')
const { preprocessDistanceField } = require('../lib/preprocessDistanceField')

const { spiralVis } = require('../lib/visTools')

const dir = 'input/'
const image = cv.imread(dir + 'input.png')

const { dist, contour, group } = preProcessImg(image, defaultOptions)
const regions = preprocessDistanceField(dist, contour, defaultOptions)

spiralVis(dist, regions, defaultOptions, __dirname)






