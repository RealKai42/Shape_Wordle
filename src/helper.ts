export class twoDimenArray {
  private array: Int8Array
  private width: number
  private height: number

  constructor(width: number, height: number, fillValue: number = 0) {
    this.width = width
    this.height = height
    this.array = new Int8Array(width * height)
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
