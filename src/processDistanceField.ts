import { roundFun, twoDimenArray, calDistance } from "./helper"
import { Options } from "./defaults"

interface extremePoint {
  pos: number[]
  value: number
  regionID: number
  ratio?: number
  epWeight?: number
  epNumber?: number
}

export interface region {
  contour: number[][]
  dist: twoDimenArray
  extremePoints: extremePoint[]
  value?: number
  area?: number
  wordsNum?: number
  wordsWeight?: number
}

export function processImageData(dist: number[][][], group: number[][], options: Options) {
  // 将输入的二维数组转为内部一位数组表现方式，优化性能
  const { width, height } = options
  const newDist: twoDimenArray[] = dist.map((item) => {
    const array = new twoDimenArray(width, height, "float", -1)
    for (const [x, y, value] of item) {
      array.set(x, y, value)
    }
    return array
  })
  const newGroup = new twoDimenArray(width, height, "int", -1)
  newGroup.fromArray(group)
  return { dist: newDist, group: newGroup }
}

export function processDistanceField(
  dist: twoDimenArray[],
  contours: number[][][],
  areas: number[]
) {
  const regions = dist.map((region, regionID) => {
    smoothDistanceField(region)
    smoothDistanceField(region)
    smoothDistanceField(region)

    // 查找极点，返回所有极点和最大极点
    let { extremePoints, maxDis, maxPoint } = findExtremePointsAndMaximum(region, regionID)

    // 过滤掉极点中的最大点
    extremePoints = extremePoints.filter(
      (p) => p.pos[0] !== maxPoint[0] || p.pos[1] !== maxPoint[1]
    )
    // 过滤和处理离最大点附近的极点
    let hasAppend = false
    for (let i = 0; i < extremePoints.length; i++) {
      const e = extremePoints[i]
      if (calDistance(extremePoints[i].pos, maxPoint) < 100) {
        if (
          i >= 1 &&
          extremePoints[i - 1].pos[0] === maxPoint[0] &&
          extremePoints[i - 1].pos[1] === maxPoint[1]
        ) {
          extremePoints.splice(i, 1)
        } else if (e.value < maxDis) {
          e.pos = maxPoint
          e.value = maxDis
        }
        hasAppend = true
      }
    }

    if (!hasAppend) {
      extremePoints.push({
        pos: maxPoint,
        value: maxDis,
        regionID,
      })
    }
    return {
      contour: contours[regionID],
      dist: region,
      extremePoints,
    } as region
  })

  let extremePoints = regions
    .map((region) => region.extremePoints)
    .reduce((total, e) => total.concat(e), [])

  // 过滤距离较近的极点
  const points: extremePoint[] = []
  extremePoints.forEach((item) => {
    let hasClosePoint = false
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      if (calDistance(item.pos, p.pos) < 60) {
        if (p.value < item.value) {
          points[i] = item
        }
        hasClosePoint = true
      }
    }
    if (!hasClosePoint) {
      points.push(item)
    }
  })

  // 将过滤后的极点分配回每个region
  extremePoints = points
  regions.forEach((region, regionID) => {
    const extremePoint = extremePoints
      .filter((e) => e.regionID === regionID)
      .sort((a, b) => b.value - a.value)
    const sum = extremePoint.reduce((total, { value }) => total + value * value, 0)
    extremePoint.forEach((e) => {
      e.ratio = roundFun((e.value * e.value) / sum, 2)
      e.value = roundFun(e.value, 2)
    })
    region.extremePoints = extremePoint
    region.value = extremePoint[0].value
    region.area = areas[regionID]
  })

  return regions
}

function smoothDistanceField(dist: twoDimenArray) {
  // 平滑距离场
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)
  const [width, height] = dist.getShape()

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const kernel = [
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1],
      ]
      let value = 0
      for (let i = 0; i < kernelSize; i++) {
        for (let j = 0; j < kernelSize; j++) {
          const offsetX = i - offset
          const offsetY = j - offset
          value += kernel[i][j] * dist.get(x + offsetX, y + offsetY)
        }
      }
      // 此处16为kernel矩阵中值的和
      dist.set(x, y, value / 16)
    }
  }
}

function findExtremePointsAndMaximum(dist: twoDimenArray, regionID: number) {
  // 寻找极点和最大点
  const points: extremePoint[] = []
  let maxDis = -Infinity
  let maxPoint: number[] = []
  let [width, height] = dist.getShape()
  for (let y = 2; y < height - 2; y++) {
    for (let x = 2; x < width - 2; x++) {
      if (dist.get(x, y) < 0) {
        // <0 为背景
        continue
      }

      if (dist.get(x, y) > maxDis) {
        maxDis = dist.get(x, y)
        maxPoint = [x, y]
      }

      // 极点应该比周围的点都大
      let cnt = 0
      for (let offsetX = -1; offsetX < 2; offsetX++) {
        for (let offsetY = -1; offsetY < 2; offsetY++) {
          if (dist.get(x + offsetX, y + offsetY) < dist.get(x, y)) {
            cnt++
          }
        }
      }
      cnt >= 8 &&
        points.push({
          pos: [x, y],
          value: dist.get(x, y),
          regionID,
        })
    }
  }
  return {
    extremePoints: points,
    maxDis,
    maxPoint,
  }
}
