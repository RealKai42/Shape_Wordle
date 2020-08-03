export class twoDimenArray {
  array: Int8Array
  constructor(private width: number, private height: number) {
    console.log(width, height)
    this.array = new Int8Array(width * height)
  }

  get(x: number, y: number): number {
    return this.array[y * this.width + x]
  }

  set(x: number, y: number, value: number): void {
    this.array[y * this.width + x] = value
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
