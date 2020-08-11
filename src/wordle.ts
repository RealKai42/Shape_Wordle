import { keyword, region, Options, extremePoint } from "./interface"
import { twoDimenArray, measureTextSize } from "./helper"
import { iterate } from "./spiral"

/**
 * 生成思想为将每个region内每个极点的单词随机放置在极点附近
 * 然后对每个单词以极点为中心，当前位置为初始位置，使用螺旋线进行排布
 * 注意 word的坐标坐标原点为单词中心, box的原点是左下角
 */

export function generateWordle(
  words: keyword[],
  regions: region[],
  group: twoDimenArray,
  options: Options
) {
  const deepCopyPosition = () => words.map((word) => [...(word.position || [])])

  words.forEach((word) => {
    createWordBox(word, options)
  })

  let prePosition: number[][] = []
  for (let regionID = 0; regionID < regions.length; regionID++) {
    const region = regions[regionID]
    let success = true
    for (let count = 0; count < 1; count++) {
      let wordle = { drawnWords: [] as keyword[], state: false }
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.regionID === regionID) {
          randomPlaceWord(word, region.extremePoints[word.epID!], regionID, group)
          wordle = wordleAlgorithm(wordle.drawnWords, word, regionID, regions, group, options)
          if (wordle.state === false) {
            success = false
            break
          }
        }
      }

      if (!success) {
        //如果cont为0，则该分区在进行第一遍循环时就有单词溢出了
        //此种情况下需要调整字号,重新分配
        if (count === 0 && options.maxFontSize >= 10) {
          regionID = -1
          options.maxFontSize--
          words.forEach((word) => createWordBox(word, options))
        } else {
          if (prePosition !== null) {
            // 无法减小fontsize则使用上次成功的结果
            words.forEach((word, id) => {
              word.position = prePosition[id]
            })
          }
          break
        }
      } else {
        prePosition = deepCopyPosition()
      }
      break
    }
  }
}

function createWordBox(word: keyword, options: Options) {
  // 设置每个单词整体的box和每个字母的box
  const { minFontSize, maxFontSize } = options
  const fontSize = Math.round((maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize)
  const { width, height, descent, ascent } = measureTextSize(
    word.name,
    fontSize,
    word.fontWeight,
    word.fontFamily
  )
  word.box = []
  word.fontSize = fontSize
  word.width = width
  word.height = height
  word.descent = descent
  word.ascent = ascent
  word.gap = 2

  word.box.push([0, descent + word.gap, width, height + 2 * word.gap])
  // 对于权重大于0.5的, 对每个字母建立box
  if (word.weight > 0.3) {
    let x = 0
    for (let i = 0; i < word.name.length; i++) {
      let { width: charW, height: charH, ascent, descent } = measureTextSize(
        word.name[i],
        fontSize,
        word.fontWeight,
        word.fontFamily
      )
      if (ascent > 0) {
        // 处理类似中文’一‘的情况, 暂时这样
        charH = ascent * 2
        descent = 2
      }
      word.box.push([x, descent + word.gap, charW, charH + 2 * word.gap])
      x += charW
    }
  }
}

function randomPlaceWord(
  word: keyword,
  center: extremePoint,
  regionID: number,
  group: twoDimenArray
) {
  // 在regionID的center附近随机放置单词
  let range = word.weight > 0.8 ? center.value / 5 : center.value / 3

  const xmax = center.pos[0] + range,
    xmin = center.pos[0] - range
  const ymax = center.pos[1] + range,
    ymin = center.pos[1] - range

  let x, y
  do {
    x = Math.round(Math.random() * (xmax - xmin + 1) + xmin)
    y = Math.round(Math.random() * (ymax - ymin + 1) + ymin)
  } while (group.get(x, y) - 1 !== regionID)

  word.position = [x, y]
}

function wordleAlgorithm(
  drawnWords: keyword[],
  word: keyword,
  regionID: number,
  regions: region[],
  group: twoDimenArray,
  options: Options
) {
  // 确定word的位置
  // drawnWords存放已经确定位置的单词
  const { width: canvasWidth, height: canvasHeight } = options
  const { extremePoints, dist } = regions[regionID]
  let count = 0
  let lastOverlapItem = null
  do {
    count++
    // 螺旋线的起点是极点的中心
    const startPoint = extremePoints[word.epID!].pos
    const newPoint = iterate(dist, startPoint, word.position!, canvasWidth, canvasHeight)
    if (newPoint) {
      word.position = [...newPoint]
    } else {
      continue
    }

    // 先检测与上次有overlap的单词，现在是否还是overlap，有overlap则失败
    if (lastOverlapItem !== null && isOverlap(lastOverlapItem, word)) continue

    // 不在shapewordle内部，则失败
    if (!isInShape(word, options, group, regionID, regions)) continue
    let foundOverlap = false

    for (let drawnWord of drawnWords) {
      if (isOverlap(drawnWord, word)) {
        // 发现碰撞，则传入碰撞的单词
        foundOverlap = true
        lastOverlapItem = drawnWord
        break
      }
    }

    if (!foundOverlap) {
      // 没发现overlap，则传入到drawnWords中，放置成功
      drawnWords.push(word)
      word.state = true
      return { drawnWords, state: true }
    }
  } while (count < 12000)

  return { drawnWords, state: false }
}

function isOverlap(word1: keyword, word2: keyword) {
  // 对单词进行的overlap碰撞检测
  function getWordPoint(word: keyword) {
    const points: number[][][] = [] // 子数组格式为[left top, right top, right bottom, left bottom]
    const { position: wordPos, angle, width, height } = word

    word.box!.forEach((box) => {
      const boxWidth = box[2]
      const boxHeight = box[3]
      const boxPos = [box[0] + wordPos![0] - width! / 2, box[1] + wordPos![1] + height! / 2]

      points.push([
        // [boxPos[0], boxPos[1] - boxHeight],
        // [boxPos[0] + boxWidth, boxPos[1] - boxHeight],
        // [boxPos[0] + boxWidth, boxPos[1]],
        // [boxPos[0], boxPos[1]],
        [boxPos[0], boxPos[1] - boxHeight],
        [boxPos[0] + boxWidth, boxPos[1] - boxHeight],
        [boxPos[0] + boxWidth, boxPos[1]],
        [boxPos[0], boxPos[1]],
      ])
    })

    if (angle != 0) {
      return points.map((point) => {
        return point.map((p) => [
          (p[0] - wordPos![0]) * Math.cos(angle!) -
            (p[1] - wordPos![1]) * Math.sin(angle!) +
            wordPos![0],
          (p[0] - wordPos![0]) * Math.sin(angle!) +
            (p[1] - wordPos![1]) * Math.cos(angle!) +
            wordPos![1],
        ])
      })
    }
    return points
  }

  function isIntersectedPolygons(a: number[][], b: number[][]) {
    const polygons = [a, b]
    for (let i = 0; i < polygons.length; i++) {
      const polygon = polygons[i]
      for (let j = 0; j < polygons.length; j++) {
        const p1 = polygon[j]
        const p2 = polygon[(j + 1) % polygon.length]
        const normal = { x: p2[1] - p1[1], y: p1[0] - p2[0] }

        const projectedA = a.map((p) => normal.x * p[0] + normal.y * p[1])
        const minA = Math.min(...projectedA)
        const maxA = Math.max(...projectedA)

        const projectedB = b.map((p) => normal.x * p[0] + normal.y * p[1])
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
      const a = p1[i],
        b = p2[j]
      return isIntersectedPolygons(a, b)
    }
  }

  return false
}

function isInShape(
  word: keyword,
  options: Options,
  group: twoDimenArray,
  regionID: number,
  regions: region[]
) {
  const { width: canvasWidth, height: canvasHeight } = options
  // 判断是否在shapewordle内
  const p = getCornerPoints(word)
  if (
    !(
      isPointInshape(p[0], canvasWidth, canvasHeight, group, regionID) &&
      isPointInshape(p[1], canvasWidth, canvasHeight, group, regionID) &&
      isPointInshape(p[2], canvasWidth, canvasHeight, group, regionID) &&
      isPointInshape(p[3], canvasWidth, canvasHeight, group, regionID)
    )
  )
    return false

  for (let { contour } of regions) {
    if (
      isIntersected(contour, p[0], p[1]) ||
      isIntersected(contour, p[1], p[2]) ||
      isIntersected(contour, p[2], p[3]) ||
      isIntersected(contour, p[3], p[0])
    )
      return false
  }
  return true
}

function getCornerPoints(word: keyword) {
  // 获得单词四个角的坐标
  const { position: pos, angle, width, height } = word

  const p = [
    // [pos[0], pos[1] - word.height], // left top
    // [pos[0] + word.width, pos[1] - word.height], // right top
    // [pos[0] + word.width, pos[1]], // right bottom
    // [pos[0] - word.width, pos[1] + word.height], // left bottom
    [pos![0] - width! / 2, pos![1] - height! / 2], // left top
    [pos![0] + width! / 2, pos![1] - height! / 2], // right top
    [pos![0] + width! / 2, pos![1] + height! / 2], // right bottom
    [pos![0] - width! / 2, pos![1] + height! / 2], // left bottom
  ]
  if (angle != 0) {
    return p.map((p) => [
      (p[0] - pos![0]) * Math.cos(angle!) - (p[1] - pos![1]) * Math.sin(angle!) + pos![0],
      (p[0] - pos![0]) * Math.sin(angle!) + (p[1] - pos![1]) * Math.cos(angle!) + pos![1],
    ])
  }
  return p
}

function isPointInshape(
  point: number[],
  canvasWidth: number,
  canvasHeight: number,
  group: twoDimenArray,
  regionID: number
) {
  // 判断点是否在shape内，且是否在对应的region内
  let [x, y] = point
  x = Math.floor(x)
  y = Math.floor(y)
  if (x >= 0 && y >= 0 && x < canvasWidth && y < canvasHeight) {
    return group.get(x, y) - 1 === regionID
  } else {
    return false
  }
}

function isIntersected(contour: number[][], p1: number[], p2: number[]) {
  //检测线段是否和边界相交
  const isLineIntersected = (aa: number[], bb: number[], cc: number[], dd: number[]) => {
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

  const crossMul = (a: number[], b: number[], c: number[]) => {
    return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1])
  }

  let intersected = false
  for (let i = 0; i < contour.length - 1; i++) {
    intersected = isLineIntersected(p1, p2, contour[i], contour[i + 1])
    if (intersected) break
  }

  if (intersected) return true
  else {
    return isLineIntersected(p1, p2, contour[contour.length - 1], contour[0])
  }
}
