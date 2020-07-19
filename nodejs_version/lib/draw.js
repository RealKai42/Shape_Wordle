/**
 * drawFillingWords 与 drawKeywords 属于计算词云的一部分，返回用于绘制的信息
 * draw 方法用于展示、输出结果
 */

const { calcScreenMinFontSize } = require('./utils')
const { outputCanvas } = require('./visTools')
const { createCanvas } = require('canvas')


function draw(keywords, fillingWords, options) {
  const { width, height, fontWeight, resizeFactor } = options
  // console.log(fillingWords)

  const canvas = createCanvas(width * resizeFactor, height * resizeFactor)
  const ctx = canvas.getContext('2d')

  keywords.forEach(({ color, fontSize, x, y, fontFamily, angle, name }) => {
    ctx.save()
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`

    ctx.fillStyle = color
    ctx.translate(x * resizeFactor, y * resizeFactor)
    ctx.rotate(angle)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(name, 0, 0)
    ctx.restore()
  })

  fillingWords.forEach(({ color, fontSize, x, y, fontFamily, angle, name }) => {
    ctx.save()
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`

    ctx.fillStyle = color
    ctx.translate(x * resizeFactor, y * resizeFactor)
    ctx.rotate(angle)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'
    ctx.fillText(name, 0, 0)
    ctx.restore()
  })

  return canvas.toBuffer()
}



function drawKeywords(words, options) {
  return words.filter(word => word.state && word.position).map(word => ({
    name: word.name,
    x: word.position[0] - word.width / 2,
    y: word.position[1] + word.height / 2,
    fontSzie: word.fontFamily,
    fontSize: word.fontSize,
    color: word.color,
    angle: word.angle,
  }))
}

module.exports = {
  drawKeywords,
  draw,
}