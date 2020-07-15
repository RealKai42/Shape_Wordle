const { defaultOptions } = require('./defaults')
const { preProcessImg } = require('./imageProcess')
const { splitText } = require('./textProcess')
const { preprocessDistanceField } = require('./preprocessDistanceField')
const cv = require('opencv4nodejs')

class ShapeWordle {
  constructor(options = {}) {
    this.options = {
      ...defaultOptions,
      ...options,
    }
  }

  generate(text, image) {
    const { dist, contour, group } = preProcessImg(image, this.options)
    const { width, height } = this.options

    this.group = group
    this.regions = preprocessDistanceField(dist, contour, width, height)
    // let words = splitText(text)


  }

}



const fs = require('fs')
const text_filename = 'demo_text_ch.txt'
const image_filename = '6.png'
const text = fs.readFileSync(text_filename, 'utf-8')
const image = cv.imread('6.png');

const shapeWordle = new ShapeWordle()
shapeWordle.generate(text, image)



module.exports = ShapeWordle

