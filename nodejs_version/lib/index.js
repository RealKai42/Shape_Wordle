const { preProcessImg } = require('./imageProcess')
const { defaultOptions } = require('./defaults')
const { preprocessDistanceField } = require('./preprocessDistanceField')
const { preprocessWords } = require('./preprocessWords')
const { allocateWords } = require('./allocateWords')
const { generateWordle } = require('./wordle')
const cv = require('opencv4nodejs')


class ShapeWordle {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  generate(text, image) {
    const { dist, contour, group, area } = preProcessImg(image, this.options)
    const { width, height } = this.options

    this.regions = preprocessDistanceField(dist, contour, width, height)

    // TODO：此处有一个bug，当‘const { splitText } = require('./textProcess.js')’放在文件首时
    // 会导致preProcessImg中计算group的部分出现问题
    const { splitText } = require('./textProcess.js')
    let words = splitText(text, this.options)
    const { keywords, fillingWords } = preprocessWords(words, this.options)
    allocateWords(keywords, this.regions, area, this.options)
    generateWordle(keywords, this.regions, group, this.options)
    console.log(keywords)



  }

}



const fs = require('fs')
const text_filename = 'demo_text_ch.txt'
const image_filename = '6.png'
const text = fs.readFileSync(text_filename, 'utf-8')
const image = cv.imread(image_filename);

// const { dist, contour, group } = preProcessImg(image, defaultOptions)
// groupVis(group, defaultOptions, __dirname)
const shapeWordle = new ShapeWordle()
shapeWordle.generate(text, image)



module.exports = ShapeWordle

