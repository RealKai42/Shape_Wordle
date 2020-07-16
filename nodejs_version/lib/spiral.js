const eps = 0.0000001

function wordleAlgorithm(drawnWords, word, regionID, regions, group, options) {
  // 确定word的位置
  // drawnWords存放已经确定位置的单词
  const { width: canvasWidth, height: canvasHeight } = options
  const { extremePoints, dist } = regions[regionID]
  let cnt = 0
  let lastCollidedItem = null
  do {
    cnt++
    const startPoint = extremePoints[word.epID].pos
    for (let i = 0; i < 5; i++) {
      const newPoint = iterate(dist, startPoint, word.position, canvasWidth, canvasHeight)
      if (newPoint) {
        word.position = [...newPoint]
      } else {
        break
      }
    }

    if (lastCollidedItem !== null && isOverlap(lastCollidedItem, word)) continue

    if (!isInShapeWord(word, options, group, regionID, regions)) continue

    let foundOverlap = false
    for (const drawnWord of drawnWords) {
      if (isOverlap(drawnWord, word)) {
        // 发现碰撞，则传入碰撞的点
        foundOverlap = true
        lastCollidedItem = drawnWord
        break
      }
    }

    if (!foundOverlap) {
      // 没发现碰撞，则传入到drawnWords中
      drawnWords.push(word)
      word.state = true
      return { drawnWords, state: true }
    }
  } while (cnt <= 12000)

  return { drawnWords, state: false }
}

const isOverlap = (word1, word2) => {
  // 对字母进行像素级的overlap碰撞检测
  const getWordPoint = word => {
    const ps = []
    const { position: pos, angle } = word
    const ratio = 1

    if (Math.abs(word.weight - 0.5) > eps && word.box) {
      word.box.forEach(box => {
        const wwidth = box[2] * 2
        const wheight = box[3] * 2
        const posr = [
          box[0] + word.position[0],
          box[1] + word.position[1]
        ]
        ps.push([
          [posr[0], posr[1]],
          [posr[0] + wwidth, posr[1]],
          [posr[0] + wwidth, posr[1] + wheight],
          [posr[0], posr[1] + wheight],
        ])
      })
    } else {
      ps.push([
        [pos[0] - word.width * ratio, pos[1] - word.height * ratio], // left top
        [pos[0] + word.width * ratio, pos[1] - word.height * ratio], // right top
        [pos[0] + word.width * ratio, pos[1] + word.height * ratio], // right bottom
        [pos[0] - word.width * ratio, pos[1] + word.height * ratio], // let bottom
      ])
    }

    if (angle != 0) {
      return ps.map(p => ([
        (p[0] - pos[0]) * Math.cos(angle) -
        (p[1] - pos[1]) * Math.sin(angle) + pos[0],
        (p[0] - pos[0]) * Math.sin(angle) +
        (p[1] - pos[1]) * Math.cos(angle) + pos[1],
      ]))
    }
    return ps
  }

  const isIntersectedPolygons = (a, b) => {
    const polygons = [a, b]
    for (let i = 0; i < polygons.length; i++) {
      const polygon = polygons[i]
      for (let j = 0; j < polygons.length; j++) {
        const p1 = polygon[j]
        const p2 = polygon[(j + 1) % polygon.length]
        const normal = { x: p2[1] - p1[1], y: p1[0] - p2[0] }

        const projectedA = a.map(p => normal.x * p[0] + normal.y * p[1])
        const minA = Math.min(...projectedA)
        const maxA = Math.max(...projectedA)

        const projectedB = b.map(p => normal.x * p[0] + normal.y * p[1])
        const minB = Math.min(...projectedB)
        const maxB = Math.max(...projectedB)

        if (maxA < minB || maxB < minA) {
          return false
        }
      }
    }
    return true
  }

  const p1 = getWordPoint(word1)
  const p2 = getWordPoint(word2)

  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      const a = p1[i], b = p2[j]
      const ok = isIntersectedPolygons(a, b)
      if (ok) return true
    }
  }

  return false
}

const getCornerPoints = (word, ratio) => {
  // 获得四个角的坐标
  const { position: pos, angle } = word

  const p = [
    [pos[0] - word.width * ratio, pos[1] - word.height * ratio], // left top
    [pos[0] + word.width * ratio, pos[1] - word.height * ratio], // right top
    [pos[0] + word.width * ratio, pos[1] + word.height * ratio], // right bottom
    [pos[0] - word.width * ratio, pos[1] + word.height * ratio], // let bottom
  ]

  if (angle != 0) {

    return p.map(p => ([
      (p[0] - pos[0]) * Math.cos(angle) -
      (p[1] - pos[1]) * Math.sin(angle) + pos[0],
      (p[0] - pos[0]) * Math.sin(angle) +
      (p[1] - pos[1]) * Math.cos(angle) + pos[1],
    ]))
  }
  return p
}

const isIntersected = (boundary, p1, p2) => {
  //检测线段是否和边界相交
  const isIntersectedPoint2 = (aa, bb, cc, dd) => {
    //检测两个线段是否相交的方法
    if (Math.max(aa[0], bb[0]) < Math.min(cc[0], dd[0])) {
      return false
    }
    if (Math.max(aa[1], bb[1]) < Math.min(cc[1], dd[1])) {
      return false
    }
    if (Math.max(cc[0], dd[0]) < Math.min(aa[0], bb[0])) {
      return false
    }
    if (Math.max(cc[1], dd[1]) < Math.min(aa[1], bb[1])) {
      return false
    }
    if (crossMul(cc, bb, aa) * crossMul(bb, dd, aa) < 0) {
      return false
    }
    if (crossMul(aa, dd, cc) * crossMul(dd, bb, cc) < 0) {
      return false
    }
    return true
  }

  const crossMul = (a, b, c) => {
    return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1]);
  }

  let ok = false
  for (let i = 0; i < boundary.length - 1; i++) {
    ok = isIntersectedPoint2(p1, p2, boundary[i], boundary[i + 1])
    if (ok) break
  }
  if (ok) return true
  else {
    return isIntersectedPoint2(p1, p2, boundary[boundary.length - 1], boundary[0])
  }
}

const isInShapePoint = (point, canvasWidth, canvasHeight, group, regionID) => {
  // 判断点是否在shape内，且是否在对应的region内
  let [x, y] = point
  x = Math.floor(x)
  y = Math.floor(y)
  if (
    x >= 0 &&
    y >= 0 &&
    x < canvasWidth &&
    y < canvasHeight
  ) {
    return group[y][x] === regionID
  } else {
    return false
  }
}

const isInShapeWord = (word, { width: canvasWidth, height: canvasHeight }, group, regionID, regions) => {
  // 判断是否在shapewordle内
  const ratio = Math.abs(0.7 - word.weight) > eps ? 0.9 : 1.0
  const p = getCornerPoints(word, ratio)

  const ok =
    isInShapePoint(p[0], canvasWidth, canvasHeight, group, regionID) &&
    isInShapePoint(p[1], canvasWidth, canvasHeight, group, regionID) &&
    isInShapePoint(p[2], canvasWidth, canvasHeight, group, regionID) &&
    isInShapePoint(p[3], canvasWidth, canvasHeight, group, regionID)
  if (!ok) return false

  for (let { boundary } of regions) {
    const ok =
      !isIntersected(boundary, p[0], p[1]) &&
      !isIntersected(boundary, p[1], p[2]) &&
      !isIntersected(boundary, p[2], p[3]) &&
      !isIntersected(boundary, p[3], p[0])
    if (!ok) return false
  }

  return true
}


const iterate = (dist, startPoint, pos, canvasWidth, canvasHeight) => {
  // 根据螺旋线迭代取得一个位置
  const point = { x: pos[0], y: pos[1] }

  // 法线方向
  const normal = computeSDF(dist, point.x, point.y)
  normal[0] = -normal[0]
  normal[1] = -normal[1]
  const norLen = norm(normal)
  // 切线
  const tangent = [-normal[1], normal[0]]
  const N = 10 // tangent speed = 2 * pi * R / N, where R = radius of curvature
  const maxTS = 1.2 // max tangent speed
  const m = 0.8; // normal speed = m * dtheta
  // 黑塞矩阵是为了计算距离场中某点的曲率
  const hessian = computeHessian(dist, point.x, point.y)
  const prepoint = [point.x - startPoint[0], point.y - startPoint[1]]
  let tem = [
    (tangent[0] * hessian.xx + tangent[1] * hessian.xy),
    (tangent[0] * hessian.xy + tangent[1] * hessian.yy),
  ]
  tem = tangent[0] * tem[0] + tangent[1] * tem[1]
  const curvature = Math.max(tem / (norLen * norLen * norLen), 0.001)
  const radius = Math.abs(1 / curvature)
  tem = 2 * Math.PI * radius / N
  let dr = [tangent[0] * tem / norLen, tangent[1] * tem / norLen]
  let normDR = norm(dr)
  if (normDR > maxTS) {
    dr = [maxTS / normDR * dr[0], maxTS / normDR * dr[1]]
  }
  if (norm(dr) < 1) {
    dr = [tangent[0] * 2 / norLen, tangent[1] * 2 / norLen]
  }
  point.x += dr[0]
  point.y += dr[1]
  tem = [point.x - startPoint[0], point.y - startPoint[1]]
  let dtheta = Math.acos(
    (prepoint[0] * tem[0] + prepoint[1] * tem[1]) / norm(prepoint) / norm(tem)
  )
  if ((prepoint[0] * tem[1] - prepoint[1] * tem[0]) < 0) //判断是正转反转
    dtheta = -dtheta
  point.x += Math.abs(m * dtheta) * normal[0] / norLen
  point.y += Math.abs(m * dtheta) * normal[1] / norLen

  // 检测是否出界
  if (point.x && point.y) {
    if (dist[Math.floor(point.x)][Math.floor(point.y)] >= 0) {
      return false
    }
    if (point.x > (canvasWidth - 2) || point.x < 2) {
      return false
    }
    if (point.y > (canvasHeight - 2) || point.y < 2) {
      return false
    }
  } else {
    return false
  }

  return [point.x, point.y]
}
const computeSDF = (data, px, py) => {
  // 计算signed distance field相关信息，得到当前点的梯度信息，作为SDF力的方向
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) }
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)
  const localGrad = { x: 0, y: 0 }
  const gradX = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
  const gradY = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]

  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset, offsetY = j - offset
      const local = data[wordPosition.x + offsetX][wordPosition.y + offsetY]
      localGrad.x += local * gradX[i][j]
      localGrad.y += local * gradY[i][j]
    }
  }

  return [localGrad.x, localGrad.y]
}

const computeHessian = (data, px, py) => {
  // Hessian 矩阵常用于描述函数局部的曲率
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) }
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)
  const gradX = [[1, 2, 1], [0, 0, 0], [-1, -2, -1]]
  const gradY = [[1, 0, -1], [2, 0, -2], [1, 0, -1]]
  const localHessian = { xx: 0, xy: 0, yy: 0 }

  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset, offsetY = j - offset
      const localGrad = computeSDF(data, wordPosition.x + offsetX, wordPosition.y + offsetY)
      localHessian.xx += localGrad[0] * gradX[i][j]
      localHessian.xy += localGrad[0] * gradY[i][j]
      localHessian.yy += localGrad[1] * gradY[i][j]
    }
  }

  return localHessian
}

const norm = (vec) => {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
}

module.exports = wordleAlgorithm