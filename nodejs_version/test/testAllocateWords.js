const fs = require('fs')
const cv = require('opencv4nodejs')
const { defaultOptions } = require('../lib/defaults')
const { preProcessImg } = require('../lib/imageProcess')
const { preprocessDistanceField } = require('../lib/preprocessDistanceField')
const { preprocessWords } = require('../lib/preprocessWords')
const { allocateWords } = require('../lib/allocateWords')
const { allocateWordsVis } = require('../lib/visTools')

const dir = 'input/'
const text_filename = dir + 'demo_text_en.txt'
const image_filename = dir + 'input.png'
const image = cv.imread(image_filename);
const text = fs.readFileSync(text_filename, 'utf-8')

const options = defaultOptions
const { dist, contour, group, area } = preProcessImg(image, options)
const regions = preprocessDistanceField(dist, contour, options)

const { splitText } = require('../lib/textProcess.js')
let words = splitText(text, options)
const { keywords, fillingWords } = preprocessWords(words, options)
allocateWords(keywords, regions, area, options)

allocateWordsVis(dist, regions, keywords, defaultOptions, __dirname)
