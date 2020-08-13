import { keyword, fillingword, Options, fillingSettings, renderableFillingWord } from "./interface"
import { twoDimenArray, calDistance } from "./helper"
import { createCanvas } from "canvas"
import {
  drawKeyword,
  outputCanvas,
  hexToRgb,
  gridVis,
  textPixelsVis,
  drawFillingword,
} from "./visTools"

export function allocateFillingWords(
  keywords: keyword[],
  fillingWords: fillingword[],
  group: twoDimenArray,
  options: Options
) {
  const {
    width: canvasWidth,
    height: canvasHeight,
    fillingFontSize,
    angleMode,
    fontFamily,
    maxFontSize,
    minFontSize,
  } = options

  const fillingSettings: fillingSettings = {
    canvasWidth: canvasWidth,
    canvasHeight: canvasHeight,
    gridSize: 2,
    rotatedWordsRatio: 0.5,
    minRotation: -Math.PI / 2,
    maxRotation: Math.PI / 2,
    angleMode,
    radiusStep: 0.5,
    angleStep: 10,

    // 后面代码填充
    gridWidth: 0,
    gridHeight: 0,
    rotationRange: 0,
    maxRadius: 0,
  }

  const renderableFillingWords: renderableFillingWord[] = []
  fillingSettings.gridWidth = canvasWidth / fillingSettings.gridSize
  fillingSettings.gridHeight = canvasHeight / fillingSettings.gridSize
  fillingSettings.rotationRange = Math.abs(
    fillingSettings.maxRotation - fillingSettings.minRotation
  )
  fillingSettings.maxRadius = Math.floor(
    Math.sqrt(
      fillingSettings.canvasWidth * fillingSettings.canvasWidth +
        fillingSettings.canvasHeight * fillingSettings.canvasHeight
    ) / 2
  )

  // 将canvas划分成格子，进行分布
  const grid = createGrid(keywords, group, fillingSettings)

  gridVis(grid)
  // const pixels = getTextPixels(fillingWords[0], 45, 10, fillingSettings)
  // textPixelsVis(fillingWords[0], pixels as number[][], 45, 10, fillingSettings.gridSize)

  // 多次填充，保证填充率
  let fontSize = fillingFontSize,
    alpha = 1
  let deltaFontSize = 2,
    deltaAlpha = 0
  const fillingTimes = 10

  for (let i = 0; i < fillingTimes; i++) {
    fillingWords.forEach((word) => {
      putWord(word, fontSize, alpha, grid, renderableFillingWords, fillingSettings)
    })
    console.log(
      `第${i + 1}次filling，当前filling words 数量 ${
        renderableFillingWords.length
      }, fontSize: ${fontSize}, alpha: ${alpha}`
    )
    gridVis(grid)

    fontSize = fontSize > deltaFontSize ? fontSize - deltaFontSize : deltaFontSize
    alpha = alpha > deltaAlpha ? alpha - deltaAlpha : deltaAlpha
  }

  return renderableFillingWords
}

function createGrid(keywords: keyword[], group: twoDimenArray, fillingSettings: fillingSettings) {
  const isPointInShape = (point: number[]) => group.get(point[0], point[1]) > 0
  const { canvasWidth, canvasHeight, gridSize, gridWidth, gridHeight } = fillingSettings
  const grid = new twoDimenArray(gridWidth, gridHeight, "int", 0)

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")
  const backgroundColor = "#000000"

  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  keywords.forEach((word) => {
    if (word.state) {
      drawKeyword(ctx, word, "#FF0000")
    }
  })

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  const backgroundPixel = hexToRgb(backgroundColor)

  for (let gridX = 0; gridX < gridWidth; gridX++) {
    for (let gridY = 0; gridY < gridHeight; gridY++) {
      // 遍历格子内部的每个像素
      grid: for (let offsetX = 0; offsetX < gridSize; offsetX++) {
        for (let offsetY = 0; offsetY < gridSize; offsetY++) {
          const [x, y] = [gridX * gridSize + offsetX, gridY * gridSize + offsetY]
          if (
            imageData[(y * canvasWidth + x) * 4] === backgroundPixel[0] &&
            isPointInShape([x, y])
          ) {
            grid.set(gridX, gridY, 1)
            break grid
          }
        }
      }
    }
  }

  return grid
}

function putWord(
  word: fillingword,
  fontSize: number,
  alpha: number,
  grid: twoDimenArray,
  renderableFillingWords: renderableFillingWord[],
  fillingSettings: fillingSettings
) {
  const { canvasWidth, canvasHeight, radiusStep, angleStep, maxRadius, gridSize } = fillingSettings
  const wordAngle = getRotateDeg(fillingSettings)
  const wordPixels = getTextPixels(word, wordAngle, fontSize, fillingSettings)
  if (!wordPixels) return false
  const { name, color, fontFamily, fontWeight } = word

  let [center, distance] = getRandomPosition()
  const Radius = maxRadius + distance

  let angle = 0
  for (let r = 0; r < Radius; r += radiusStep) {
    const [dX, dY] = getSpiralPoint(angle, r)
    const [x, y] = [center[0] + dX, center[1] + dY]

    if (
      x >= 0 &&
      y >= 0 &&
      x < canvasWidth &&
      y < canvasHeight &&
      canPutWordAtPoint(grid, wordPixels, x, y, fillingSettings)
    ) {
      renderableFillingWords.push({
        name,
        x,
        y,
        fontSize,
        fontFamily,
        fontWeight,
        color,
        angle: wordAngle,
        alpha,
      })
      return true
    }
    angle = angle >= 360 ? 0 : angle + angleStep * ((Radius - r) / Radius)
  }
  return false

  function getSpiralPoint(angle: number, r: number) {
    return [r * Math.cos((angle / 180) * Math.PI), r * Math.sin((angle / 180) * Math.PI)]
  }

  function getRandomPosition(): [number[], number] {
    const offset = 80
    const center = [canvasWidth / 2, canvasHeight / 2]
    const [xMin, xMax] = [center[0] - offset, center[0] + offset]
    const [yMin, yMax] = [center[1] - offset, center[1] + offset]

    const x = Math.round(Math.random() * (xMax - xMin + 1) + xMin)
    const y = Math.round(Math.random() * (yMax - yMin + 1) + yMin)

    const distance = calDistance([x, y], center)
    return [[x, y], distance]
  }
}

function canPutWordAtPoint(
  grid: twoDimenArray,
  wordPixels: number[][],
  x: number,
  y: number,
  fillingSettings: fillingSettings
) {
  // 遍历像素,看是否能放置

  const { gridWidth, gridHeight, gridSize } = fillingSettings

  for (let pixel of wordPixels) {
    const gridX = x / gridSize + pixel[0],
      gridY = y / gridSize + pixel[1]
    if (gridX < 0 || gridY < 0 || gridX >= gridWidth || gridY >= gridHeight) return false

    if (grid.get(gridX, gridY) === 0) {
      return false
    }
  }
  // 可放置则更新grid
  wordPixels.forEach((pixel) => {
    const gridX = x / gridSize + pixel[0],
      gridY = y / gridSize + pixel[1]
    grid.set(gridX, gridY, 0)
  })

  return true
}

function getRotateDeg(settings: fillingSettings) {
  const { rotatedWordsRatio, angleMode, minRotation, maxRotation, rotationRange } = settings
  // 根据设定的filling word mode 去返回角度
  if (angleMode == 2) {
    // 随机角度
    return Math.random() * (maxRotation - minRotation + 1) + minRotation
  } else if (angleMode == 3) {
    // 45度向上 \\
    return Math.PI / 4
  } else if (angleMode == 4) {
    // 4-45度向下//
    return -Math.PI / 4
  } else if (angleMode == 5) {
    // 5-45度向上以及向下 /\
    return Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4
  } else {
    // 0-全横，1-横竖 模式下的filling words
    return Math.random() > rotatedWordsRatio
      ? 0
      : minRotation + Math.floor(Math.random() * 2) * rotationRange
  }
}

function getTextPixels(
  word: fillingword,
  angle: number,
  fontSize: number,
  fillingSettings: fillingSettings
) {
  if (fontSize < 0) return false
  const { gridSize } = fillingSettings
  const canvasWidth = 200,
    canvasHeight = 200
  const wordPixels = []
  const gridWidth = canvasWidth / gridSize,
    gridHeight = canvasHeight / gridSize

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")
  const backgroundColor = "#000000"
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, canvasWidth, canvasHeight)

  const x = canvasWidth / 2,
    y = canvasHeight / 2

  drawFillingword(ctx, word, x, y, fontSize, angle, "#ff0000")

  const [baseGridX, baseGridY] = [x / gridSize, y / gridSize]

  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  for (let gridX = 0; gridX < gridWidth; gridX++) {
    for (let gridY = 0; gridY < gridHeight; gridY++) {
      grid: for (let offsetX = 0; offsetX < gridSize; offsetX++) {
        for (let offsetY = 0; offsetY < gridSize; offsetY++) {
          const [x, y] = [gridX * gridSize + offsetX, gridY * gridSize + offsetY]
          if (imageData[(y * canvasWidth + x) * 4] !== 0) {
            wordPixels.push([gridX - baseGridX, gridY - baseGridY])
            break grid
          }
        }
      }
    }
  }

  return wordPixels
}
