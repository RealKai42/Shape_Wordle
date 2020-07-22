const { createCanvas } = require('canvas')
const { outputCanvas, drawWord } = require('./visTools')

const canvasWidth = 400, canvasHeight = 400
const canvas = createCanvas(canvasWidth, canvasHeight)
const ctx = canvas.getContext('2d')

function measureTextSize(text, fontSize, fontName, out = false) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.font = `${fontSize}px ${fontName}`
  ctx.textAlign = 'start'
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#000000'
  const fillX = 200, fillY = 200
  ctx.fillText(text, 200, 200)

  const size = ctx.measureText(text)
  const width = size.width

  // 高度只能够自己测量，size提供的数据不准确，扫描线算法
  const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  let first = 0, last = 0, y = canvasHeight

  // 找到最后一非空白行
  while (!last && y) {
    y--
    for (let x = 0; x < canvasWidth; x++) {
      if (data[y * canvasWidth * 4 + x * 4 + 3]) {
        last = y + 1
        break
      }
    }
  }
  // 找到第一行非空白行
  y = 0
  while (!first && y < canvasHeight) {
    y++
    for (let x = 0; x < canvasWidth; x++) {
      if (data[y * canvasWidth * 4 + x * 4 + 3]) {
        first = y - 1
        break
      }
    }
  }
  const height = last - first
  const ascent = fillY - last
  const descent = last - fillY
  if (out) {
    // console.log(text, first, last, ascent, descent)
    drawLine(ctx, 0, first, 400, first)
    drawLine(ctx, 0, last, 400, last)
    drawLine(ctx, 0, fillY, 400, fillY)
    outputCanvas(canvas)
  }

  return { width, height, ascent, descent }
}

function drawLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.lineWidth = 1
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.closePath();
}


//保留n位小数
function roundFun(value, n) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n);
}


module.exports = {
  measureTextSize,
  roundFun,
}