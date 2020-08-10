import { keyword } from "./interface"
import { region } from "./interface"
import { Options } from "./interface"
import { roundFun, measureTextSize } from "./helper"

export function allocateWords(
  words: keyword[],
  regions: region[],
  areas: number[],
  options: Options
) {
  allocateWordsToRegions(words, regions, areas, options)
  allocateWordsToExtremePoint(words, regions, areas, options)
}

function allocateWordsToRegions(
  words: keyword[],
  regions: region[],
  areas: number[],
  options: Options
) {
  // 将单词分配到各个区域

  const { keywordsNum, baseOnAreaOrDisValue } = options

  const wordsMinWeight = Math.min(...words.map((word) => word.weight))
  const areaMax = Math.max(...areas)
  const areaMaxId = areas.indexOf(areaMax)
  const totalArea = areas.reduce((totalArea, area) => totalArea + area, 0)

  const values = regions.map((region) => region.value!)
  const valueMax = Math.max(...values)
  const valueMaxId = values.indexOf(valueMax)

  // 给每个区域分配单词数量和权重限制
  let wordsSum = 0
  regions.forEach((region) => {
    const { area, value } = region
    const wordsNum =
      value! <= 18 && valueMax > 45 ? 0 : Math.round((area! / totalArea) * keywordsNum)
    wordsSum += wordsNum
    let wordsWeight = baseOnAreaOrDisValue ? area! / areaMax : value! / valueMax
    if (wordsNum < 3) {
      wordsWeight = wordsMinWeight
    }
    region.wordsNum = wordsNum
    region.wordsWeight = wordsWeight
  })
  if (wordsSum !== keywordsNum) {
    regions[areaMaxId].wordsNum! += keywordsNum - wordsSum
  }
  const wordsNums = regions.map((region) => region.wordsNum!)

  let currRegion = baseOnAreaOrDisValue ? areaMaxId : valueMaxId

  // 对每个单词进行分配
  words.forEach((word) => {
    let failCounter = 0
    word.regionID = -1
    do {
      if (wordsNums[currRegion] > 0 && word.weight <= regions[currRegion].wordsWeight!) {
        // console.log(word.name)
        if (
          (regions[currRegion].extremePoints[0].value < 24 && word.name.length <= 5) ||
          regions[currRegion].extremePoints[0].value >= 24
        ) {
          word.regionID = currRegion
          wordsNums[currRegion]
        }
      }
      currRegion = (currRegion + 1) % regions.length
      failCounter++
    } while (word.regionID === -1 && failCounter < regions.length * 3)

    // 未分配则分配为value/area最大的区域
    if (word.regionID === -1) {
      word.regionID = baseOnAreaOrDisValue ? areaMaxId : valueMaxId
    }
  })
}

function allocateWordsToExtremePoint(
  words: keyword[],
  regions: region[],
  areas: number[],
  options: Options
) {
  const { isMaxMode } = options
  const wordsMinWeight = Math.min(...words.map((word) => word.weight))
  // 给每个极点分配单词数量和权重
  regions.forEach((region, regionID) => {
    let wordsSum = 0
    region.extremePoints.forEach((ep) => {
      ep.epWeight = (ep.ratio! / region.extremePoints[0].ratio!) * region.wordsWeight!
      ep.epNumber = ep.value < 20 ? 0 : Math.round(ep.ratio! * region.wordsNum!)
      wordsSum += ep.epNumber
      ep.epWeight = Math.max(ep.epWeight, wordsMinWeight)
      ep.epWeight = roundFun(ep.epWeight, 2)
    })
    if (wordsSum !== region.wordsNum) {
      region.extremePoints[0].epNumber! += region.wordsNum! - wordsSum
    }
    // 给每个极点分配单词
    let currEP = 0
    let wordsNumbers = region.extremePoints.map((ep) => ep.epNumber!)
    words.forEach((word) => {
      if (word.regionID === regionID) {
        let failCounter = 0
        word.epID = -1
        do {
          if (wordsNumbers[currEP] > 0 && word.weight <= region.extremePoints[currEP].epWeight!) {
            word.epID = currEP
            wordsNumbers[currEP]--
          }
          currEP = (currEP + 1) % region.extremePoints.length
          failCounter++
        } while (word.epID === -1 && failCounter < region.extremePoints.length * 2)

        if (word.epID === -1) {
          word.epID = 0
        }
      }
    })
  })

  if (isMaxMode) {
    // todo
  } else {
    // 正常模式下，在给定的范围内确定最大字号
    let l = options.minFontSize,
      r = options.maxFontSize
    let fontSize = r
    while (r - l > 1) {
      const mid = Math.floor((l + r) / 2)
      const ratios = computeRatios(mid)
      if (ratios.every((ratio) => ratio <= 0.65)) {
        fontSize = mid
        l = mid
      } else {
        r = mid
      }
    }
    options.maxFontSize = fontSize
  }

  function computeRatios(maxFontSize: number) {
    // 计算空白率
    const { minFontSize } = options
    return regions.map((region, regionID) => {
      let area = 0
      words.forEach((word) => {
        if (word.regionID === regionID) {
          const fontSize = (maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize
          const { width } = measureTextSize(word.name, fontSize, word.fontFamily)
          area += (fontSize + 1) * (width + 4)
        }
      })
      return area / region.area!
    })
  }
}
