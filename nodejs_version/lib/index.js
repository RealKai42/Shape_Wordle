const { preProcessImg } = require('./imageProcess')
const { defaultOptions } = require('./defaults')
const { preprocessDistanceField } = require('./preprocessDistanceField')
const { preprocessWords } = require('./preprocessWords')
const { allocateWords } = require('./allocateWords')
const { generateWordle } = require('./wordle')
const { draw, drawKeywords } = require('./draw')
const { drawFillingWords } = require('./filling')
const cv = require('opencv4nodejs')

const { debugDraw } = require('./visTools')


class ShapeWordle {
  constructor(options = {}) {
    this.userOptions = options
  }

  generate(text, image) {
    // 计算时，会修改options中的数据，所以每次generate重新取一下option
    this.options = {
      ...defaultOptions,
      ...this.userOptions,
    }
    const { dist, contour, group, area } = preProcessImg(image, this.options)
    const { width, height } = this.options

    if (this.options.debug) {
      const { createCanvas } = require('canvas')
      const { distanceVis, outputCanvas } = require('./visTools')
      this.options.canvas = createCanvas(width, height)
      this.options.ctx = this.options.canvas.getContext('2d')
      const distImageData = distanceVis(dist, this.options, __dirname, false)
      this.options.ctx.putImageData(distImageData, 0, 0)
      // outputCanvas(this.options.canvas)
    }

    this.regions = preprocessDistanceField(dist, contour, this.options)
    // TODO：此处有一个bug，当‘const { splitText } = require('./textProcess.js')’放在文件首时
    // 会导致preProcessImg中计算group的部分出现问题
    const { splitText } = require('./textProcess.js')
    let words = splitText(text, this.options)
    const { keywords, fillingWords } = preprocessWords(words, this.options)
    allocateWords(keywords, this.regions, area, this.options)
    this.options.dist = dist
    generateWordle(keywords, this.regions, group, this.options)

    // debugDraw(keywords, this.options, this.options.canvas)


    // 获取单词位置
    const fillingWordsWithPos = drawFillingWords(keywords, fillingWords, group, this.options)
    const keywordsWithPos = drawKeywords(keywords, this.options)
    const outimage = draw(keywordsWithPos, fillingWordsWithPos, this.options)
    return outimage
  }
}
module.exports = ShapeWordle

