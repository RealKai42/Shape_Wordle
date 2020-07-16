const { measureTextSize, measureTextHW } = require("./utils")
const wordleAlgorithm = require("./spiral")

function generateWordle(words, regions, group, options) {
  const { keywordsNum, isMaxMode } = options

  const createRandomArray = (length) => {
    const remain = Math.floor(0.25 * keywordsNum)
    const arr = Array(length - remain).fill().map((_, i) => i)
    for (let i = length - remain; i < length; i++) {
      arr.splice(Math.floor(Math.random() * arr.length), 0, i)
    }
    return arr
  }
  const randomArray = createRandomArray(words.length)
  const deepCopyPosition = () => words.map(word => [...(word.position || [])])
  let prePosition = null
  words.forEach(word => {
    createBox(word, options)
    word.state = false
  })

  key: for (let regionID = 0; regionID < regions.length; regionID++) {
    // 每次排布一个region的单词
    const region = regions[regionID]
    if (isMaxMode) {

    } else {
      let sucess = true
      for (let cont = 0; cont < 1; cont++) {
        let wordle = { drawnWords: [], state: true }
        for (let i of randomArray) {
          const word = words[i]
          if (word.regionID === regionID) {
            word.width++
            word.height++
            word.gap++
            placeWord(word, region.extremePoints[word.epID], regionID, group, options)
            wordle = wordleAlgorithm(
              wordle.drawnWords,
              word,
              regionID,
              regions,
              group,
              options,
            )
            // break key
            if (wordle.state === false) {
              // wordlepara.state 这个状态代表有没有单词在运行Wordle算法的时候旋转到了图形外面
              sucess = false
              break
            }
          }
        }

        if (!sucess) {
          // 未分配成功则减小fontsize，重新分配
          if (cont === 0 && options.maxFontSize >= 10) {
            regionID = -1
            options.maxFontSize--
            words.forEach(word => createBox(word, options.maxFontSize))
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


      }

    }
  }
}

function createBox(word, options) {
  // 设置每个单词整体的box和每个字母的box
  const { eps, minFontSize, maxFontSize } = options
  const fontSize = (maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize
  const { width } = measureTextSize(word.name, fontSize, word.fontFamily)
  word.gap = 2
  word.width = width / 2 + 2
  // 量宽高
  const textSize = measureTextHW(0, 0, 150, 200, fontSize, word.fontFamily, word.name)
  word.descent = textSize.descent
  word.height = textSize.height / 2 + 2

  // 对于权重大于0.5的, 对每个字母建立box
  if (Math.abs(word.weight - 0.5) > eps) {
    word.box = []
    const textSize = measureTextHW(0, 0, 200, 200, fontSize, word.fontFamily, 'a')

    const aH = textSize.height / 2
    const aD = textSize.descent
    // [x, y, witdh, height] 
    word.box.push([
      -word.width,
      word.height - word.descent + aD - 2 * (aH + word.gap),
      word.width,
      aH + word.gap,
    ])

    const pureWidth = -(word.width - word.gap)
    let occupied = 0
    for (let i = 0; i < word.name.length; i++) {
      const textSize = measureTextHW(0, 0, 150, 200, fontSize, word.fontFamily, word.name[i])
      const ch = textSize.height / 2
      const cw = textSize.width / 2
      const cd = textSize.descent
      if (ch !== aH) {
        word.box.push([
          occupied + pureWidth - word.gap,
          word.height - word.descent + cd - 2 * ch - 2 * word.gap,
          cw + word.gap,
          ch + word.gap
        ])
      }
      occupied += cw * 2
    }
  }

}


function placeWord(word, center, regionID, group, options) {
  // 在regionID的center附近随机放置单词
  const {
    isMaxMode,
    eps,
  } = options
  // tem为偏移中心的距离
  let tem = isMaxMode ? center.value / 2 : center.value / 3
  if (Math.abs(word.weight - 0.8) > eps) {
    tem = center.value / 5
  }

  const xmax = center.pos[0] + tem, xmin = center.pos[0] - tem
  const ymax = center.pos[1] + tem, ymin = center.pos[1] - tem

  // 在该region中，在tem的限制下，随机分配个位置
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