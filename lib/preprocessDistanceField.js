const { roundFun } = require('./utils')

function preprocessDistanceField(dists, contours, { width, height }) {
  // 对输入的distance field 和 contour 进行预处理，处理成多个region
  // {boudary, dist, extremePoints}

  const regions = dists.map((region, regionID) => {
    // 构建距离场
    const dist = []
    for (let x = 0; x < width; x++) {
      dist.push(Array(height).fill(-1))
    }
    // 填充值
    for (const [x, y, value] of region) {
      dist[x][y] = value
    }
    smoothing(dist)
    smoothing(dist)
    smoothing(dist)

    // 查找极点
    // minD记录最小点的值，center记录最小点的坐标
    // extremePoints 记录所有的极点
    let {
      extremePoints,
      maxD,
      center,
    } = findExtremePointsAndMaximum(dist, regionID)

    // 过滤掉极点中与最大点x值或y值相等的
    extremePoints = extremePoints.filter(p => p.pos[0] != center[0] || p.pos[1] != center[1])
    // 过滤掉一些离最大点距离近的
    let hasAppend = false
    for (let i = 0; i < extremePoints.length; i++) {
      const e = extremePoints[i]
      if (calcDistance(extremePoints[i].pos, center) < 100) {
        if (i >= 1 && extremePoints[i - 1].pos[0] === center[0] && extremePoints[i - 1].pos[1] === center[1]) {
          extremePoints.splice(i, 1)
        } else if (e.value < maxD) {
          e.pos = center
          e.value = maxD
        }
        hasAppend = true
      }
    }
    if (!hasAppend) {
      extremePoints.push({
        pos: center,
        value: maxD,
        regionID
      })
    }
    return {
      contour: contours[regionID],
      dist,
      extremePoints
    }

  })

  // 继续过滤极点
  let extremePoints = regions
    .map(region => region.extremePoints)
    .reduce((total, e) => total.concat(e), [])

  const points = []
  extremePoints.forEach(item => {
    let hasClosePoint = false
    for (let i = 0; i < points.length; i++) {
      const p = points[i]
      if (calcDistance(item.pos, p.pos) < 60) {
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
  extremePoints = points



  regions.forEach((region, regionID) => {
    const extremePoint = extremePoints
      .filter(e => e.regionID === regionID)
      .sort((a, b) => b.value - a.value)
    const sum = extremePoint.reduce((total, { value }) => total + value * value, 0)
    extremePoint.forEach(e => {
      e.ratio = roundFun((e.value * e.value) / sum, 2)
      e.value = roundFun(e.value, 2)

    })
    region.extremePoints = extremePoint
  })
  return regions
}

const smoothing = data => {
  // 平滑距离场
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)

  for (let x = 1; x < data.length - 1; x++) {
    for (let y = 1; y < data[x].length - 1; y++) {
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
          value += kernel[i][j] * data[x + offsetX][y + offsetY]
        }
      }
      data[x][y] = value / 16
    }
  }
}

const findExtremePointsAndMaximum = (data, regionID) => {
  // 寻找极点和最大点
  const points = []
  let maxD = -Infinity
  let center = []
  for (let i = 2; i < data.length - 2; i++) {
    for (let j = 2; j < data[i].length - 2; j++) {
      if (data[i][j] > maxD) {
        maxD = data[i][j]
        center = [i, j]
      }
      if (data[i][j] < 0) {
        // <0为背景
        continue
      }
      // 极点应该比周围的点都大
      let cnt = 0
      for (let offsetX = -1; offsetX < 2; offsetX++) {
        for (let offsetY = -1; offsetY < 2; offsetY++) {
          if (data[i + offsetX][j + offsetY] < data[i][j]) {
            cnt++
          }
        }
      }
      cnt >= 8 && points.push({
        pos: [i, j],
        value: Math.abs(data[i][j]),
        regionID,
      })
    }
  }
  return {
    extremePoints: points,
    maxD,
    center,
  }
}

const calcDistance = (p1, p2) => {
  return Math.sqrt(
    (p1[0] - p2[0]) * (p1[0] - p2[0]) +
    (p1[1] - p2[1]) * (p1[1] - p2[1])
  )
}

module.exports = {
  preprocessDistanceField
}