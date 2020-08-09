import { roundFun, randomInt } from "./helper"
import { Word } from "./textProcess"
import { Options } from "./defaults"

interface keyword {
  name: string
  weight: number
  color: string
  fontFamily: string
  angle?: number
}

interface fillingword {
  name: string
  weight: number
  color: string
}

export function processWords(words: Word[], options: Options) {
  const { angleMode, language } = options
  const { keywords, fillingWords } = separateWords(words, options)
  keywords.forEach((word) => {
    word.angle = calcAngle(word.weight, angleMode)
  })

  return { keywords, fillingWords }
}

function separateWords(words: Word[], options: Options) {
  const {
    keywordsNum,
    keywordColor,
    fillingWordColor,
    language,
    cnFontFamily,
    enFontFamily,
  } = options
  const fontFamily = language === "cn" ? cnFontFamily : enFontFamily
  options.fontFamily = fontFamily
  if (words.length < keywordsNum) {
    throw new Error(
      `At least ${keywordsNum} words is required. We got ${words.length} words instead.`
    )
  }

  const keywords: keyword[] = words.slice(0, keywordsNum).map(({ name, weight }) => ({
    name: name.trim(),
    weight: weight < 0.02 ? 0.02 : roundFun(weight, 3),
    color: keywordColor,
    fontFamily,
  }))

  const start = words.length >= 160 ? keywordsNum : 0
  const end = Math.min(words.length, start + 200)

  const fillingWords = words
    .slice(start, end)
    .map(
      ({ name }) =>
        ({ name: name.trim(), weight: 0.05, color: fillingWordColor || "#000000" } as fillingword)
    )

  while (fillingWords.length < 200) {
    fillingWords.push({ ...fillingWords[randomInt(0, fillingWords.length)] })
  }

  return { keywords, fillingWords }
}

function calcAngle(weight: number, angleMode: number) {
  const max = Math.PI / 2
  const min = -Math.PI / 2

  switch (angleMode) {
    case 0:
      return 0
    case 1:
      if (weight > 0.5) {
        return 0
      }
      if (Math.random() > 0.6) {
        return Math.random() > 0.5 ? max : min
      } else {
        return 0
      }
    case 2:
      return Math.random() * (max - min + 1) + min
    case 3:
      return Math.PI / 4
    case 4:
      return -Math.PI / 4
    case 5:
      if (Math.random() > 0.5) {
        return Math.PI / 4
      } else {
        return -Math.PI / 4
      }
    default:
      return 0
  }
}
