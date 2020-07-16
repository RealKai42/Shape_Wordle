const LRU = require("lru-cache")
const { createCanvas } = require('canvas')

const canvas = createCanvas(500, 400)
const canvasCtx = canvas.getContext('2d')
const measureTextSizeCache = new LRU({
  max: 2000,
  maxAge: 1000 * 60 * 30
})

function measureTextSize(text, fontSize, fontName) {
  const cacheKey = `${text}_${fontSize}_${fontName}`
  const cachedValue = measureTextSizeCache.get(cacheKey)
  if (cachedValue) {
    return cachedValue
  }
  canvasCtx.font = `${fontSize}px ${fontName}`
  const size = canvasCtx.measureText(text)
  measureTextSizeCache.set(cacheKey, size)
  return size
}

const measureTextHWCache = new LRU({
  max: 2000,
  maxAge: 1000 * 60 * 30
})

const measureTextHW = (left, top, width, height, fontSize, fontName, text) => {
  const cacheKey = `${left}-${top}-${width}-${height}-${fontSize}-${fontName}-${text}`
  const cachedValue = measureTextHWCache.get(cacheKey)
  if (cachedValue) {
    return cachedValue
  }
  // 绘制文本到指定区域
  canvasCtx.clearRect(0, 0, 500, 400)
  canvasCtx.save()
  canvasCtx.translate(left, fontSize + 10)
  canvasCtx.font = `${fontSize}px ${fontName}`
  canvasCtx.fillStyle = '#000000'
  canvasCtx.fillText(text, 0, 0)
  const wordWidth = canvasCtx.measureText(text).width
  canvasCtx.restore()

  const data = canvasCtx.getImageData(left, top, width, height).data
  let first = 0, last = 0, descent = 0
  let y = height
  // 扫描线算法

  // 找到最后一非空白行
  while (!last && y) {
    y--
    for (let x = 0; x < width; x++) {
      if (data[y * width * 4 + x * 4 + 3]) {
        last = y
        break
      }
    }
  }
  // 找到第一行非空白行
  while (y) {
    // console.log(y)
    y--
    for (let x = 0; x < width; x++) {
      if (data[y * width * 4 + x * 4 + 3]) {
        // 用descent表示单词绘制时，y轴上离绘制点的gap
        if (y > fontSize + 10) descent++
        first = y
        break
      }
    }
  }

  const value = {
    height: last - first,
    width: wordWidth,
    descent: descent
  }
  measureTextHWCache.set(cacheKey, value)
  return value
}

module.exports = {
  measureTextSize,
  measureTextHW
}