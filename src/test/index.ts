import { preProcessImg } from "../imageProcess"
import {
  groupVis,
  distanceVis,
  contourVis,
  extremePointVis,
  allocateWordsVis,
  spiralVis,
} from "../visTools"
import { defaultOptions, Options } from "../defaults"
import { splitText } from "../textProcess"
import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"
import { processImageData, processDistanceField } from "../processDistanceField"
import { processWords, keyword } from "../processWords"
import { allocateWords } from "../allocateWords"

const dir = path.resolve(__dirname, "../../assets/")
const image = cv.imread(path.resolve(dir, "input2.png"), cv.IMREAD_UNCHANGED)
const text = fs.readFileSync(path.resolve(dir, "demo_text_en.txt"), "utf-8")
const options = defaultOptions
const outputDir = path.resolve(__dirname, "imageProcess")
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir)
}

const words = splitText(text, options)
const { keywords, fillingWords } = processWords(words, options)

const { dist: distRaw, contours, group: groupRaw, areas } = preProcessImg(image, options)
const { dist, group } = processImageData(distRaw, groupRaw, defaultOptions)
const regions = processDistanceField(dist, contours, areas)
allocateWords(keywords, regions, areas, options)

// 可视化 or 打印信息
console.log(`------------------------------------------------------`)
console.log("单词数量", words.length)
for (let i = 0; i < 10; i++) {
  console.log(words[i])
}

distanceVis(dist, options, outputDir)
groupVis(group, options, outputDir)
contourVis(contours, options, outputDir)
console.log(`------------------------------------------------------`)
console.log("regions 信息")
extremePointVis(dist, regions, options, outputDir)
console.log(`------------------------------------------------------`)
console.log("keywords 分配信息")
allocateWordsVis(dist, regions, keywords, options, outputDir)

spiralVis(dist, regions, options, outputDir)
