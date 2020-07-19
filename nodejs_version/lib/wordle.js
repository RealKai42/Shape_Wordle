/**
 * 生成思想为将每个region内每个极点的单词随机放置在极点附近
 * 然后对每个单词以极点为中心，当前位置为初始位置，使用螺旋线进行排布
 * 注意 word的坐标坐标原点为单词中心, box的原点是左下角
 * 修改为原点在中心
 */

const { measureTextSize } = require("./utils")
const { drawWord, debugDraw } = require('./visTools')
const { wordleAlgorithm } = require("./spiral")
const { outputCanvas } = require('./visTools')

function generateWordle(words, regions, group, options) {
  const deepCopyPosition = () => words.map(word => [...(word.position || [])])

  let prePosition = null
  words.forEach(word => {
    createWordBox(word, options)
  })

  for (let regionID = 0; regionID < regions.length; regionID++) {
    const region = regions[regionID]
    let success = true
    for (let count = 0; count < 20; count++) {
      let wordle = { drawnWords: [] }
      for (let i = 0; i < words.length; i++) {
        const word = words[i]
        if (word.regionID === regionID) {
          randomPlaceWord(word, region.extremePoints[word.epID], regionID, group, options)
          wordle = wordleAlgorithm(
            wordle.drawnWords,
            word,
            regionID,
            regions,
            group,
            options,
          )
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
          words.forEach(word => createWordBox(word, options))
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

function createWordBox(word, options) {
  // 设置每个单词整体的box和每个字母的box
  const { eps, minFontSize, maxFontSize } = options
  const fontSize = Math.round((maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize)
  const { width, height, descent, ascent } = measureTextSize(word.name, fontSize, word.fontFamily)
  word.box = []
  word.fontSize = fontSize
  word.width = width
  word.height = height
  word.descent = descent
  word.ascent = ascent
  word.gap = 2

  word.box.push([
    0,
    descent + word.gap,
    width,
    height + 2 * word.gap
  ])
  // 对于权重大于0.5的, 对每个字母建立box
  if ((word.weight - 0.1) > eps) {
    let x = 0
    for (let i = 0; i < word.name.length; i++) {
      let { width: charW, height: charH, ascent, descent } = measureTextSize(word.name[i], fontSize, word.fontFamily)
      if (ascent > 0) {
        // 处理类似中文’一‘的情况, 暂时这样
        charH = ascent * 2
        descent = 2
      }
      word.box.push([
        x,
        descent + word.gap,
        charW,
        charH + 2 * word.gap,
      ])
      x += charW
    }
  }
}

function randomPlaceWord(word, center, regionID, group, options) {
  // 在regionID的center附近随机放置单词
  const { eps } = options

  let range = center.value / 3
  if (word.weight - 0.8 > eps) {
    range = center.value / 5
  }
  const xmax = center.pos[0] + range, xmin = center.pos[0] - range
  const ymax = center.pos[1] + range, ymin = center.pos[1] - range

  let x, y
  do {
    x = Math.round(Math.random() * (xmax - xmin + 1) + xmin)
    y = Math.round(Math.random() * (ymax - ymin + 1) + ymin)
  } while ((group[y][x] - 2) !== regionID)

  word.position = [x, y]
}

module.exports = {
  generateWordle
}