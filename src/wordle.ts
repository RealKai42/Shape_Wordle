import { keyword, region, Options } from "./interface"
import { twoDimenArray, measureTextSize } from "./helper"

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
  words.forEach((word) => {
    createWordBox(word, options)
  })
}

function createWordBox(word: keyword, options: Options) {
  // 设置每个单词整体的box和每个字母的box
  const { eps, minFontSize, maxFontSize } = options
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
      if (ascent < 0) {
        // 处理类似中文’一‘的情况, 暂时这样
        charH = ascent * 2
        descent = 2
      }
      word.box.push([x, descent + word.gap, charW, charH + 2 * word.gap])
      x += charW
    }
  }
}
