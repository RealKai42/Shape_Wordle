const LRU = require("lru-cache")
const { createCanvas } = require('canvas')

const canvasCtx = createCanvas(500, 400).getContext('2d')
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

module.exports = {
  measureTextSize,
}