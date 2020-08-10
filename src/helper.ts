import { createCanvas } from "canvas"
import { outputCanvas } from "./visTools"
export class twoDimenArray {
  private array: Float32Array | Int8Array
  private width: number
  private height: number

  constructor(width: number, height: number, type: string = "int", fillValue: number = 0) {
    this.width = width
    this.height = height

    if (type === "int") {
      this.array = new Int8Array(width * height)
    } else {
      this.array = new Float32Array(width * height)
    }

    if (fillValue !== 0) {
      this.array.fill(fillValue)
    }
  }

  get(x: number, y: number): number {
    return this.array[y * this.width + x]
  }

  set(x: number, y: number, value: number): void {
    this.array[y * this.width + x] = value
  }

  getShape() {
    return [this.width, this.height]
  }

  fromArray(array: number[][]) {
    for (let y = 0; y < array.length; y++) {
      for (let x = 0; x < array[y].length; x++) {
        this.array[y * this.width + x] = array[y][x]
      }
    }
  }

  toArray(): Array<number>[] {
    const reArray: Array<Array<number>> = []
    for (let y = 0; y < this.height; y++) {
      reArray.push([])
      for (let x = 0; x < this.width; x++) {
        reArray[y][x] = this.array[y * this.width + x]
      }
    }
    return reArray
  }
}

export function measureTextSize(text: string, fontSize: number, fontName: string, out = false) {
  const canvasWidth = 400,
    canvasHeight = 400
  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext("2d")

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  ctx.font = `${fontSize}px ${fontName}`
  ctx.textAlign = "start"
  ctx.textBaseline = "alphabetic"
  ctx.fillStyle = "#000000"
  const fillX = 200,
    fillY = 200
  ctx.fillText(text, 200, 200)

  const size = ctx.measureText(text)
  const width = size.width

  // 高度只能够自己测量，size提供的数据不准确，扫描线算法
  const data = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
  let first = 0,
    last = 0,
    y = canvasHeight

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

function drawLine(ctx: any, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath()
  ctx.lineWidth = 1
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
  ctx.closePath()
}

export function calDistance(p1: number[], p2: number[]) {
  return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]))
}

export class Timer {
  private last: number
  constructor() {
    this.last = Date.now()
  }

  tick(msg: string) {
    console.log(`${msg}: ${Date.now() - this.last}`)
    this.last = Date.now()
  }
}

//保留n位小数
export function roundFun(value: number, n: number) {
  return Math.round(value * Math.pow(10, n)) / Math.pow(10, n)
}

export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min
}
