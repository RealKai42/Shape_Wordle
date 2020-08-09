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

export function calcDistance(p1: number[], p2: number[]) {
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
