import { preProcessImg } from "../imageProcess"
import {
  groupVis,
  distanceVis,
  contourVis,
  extremePointVis,
  allocateWordsVis,
  spiralVis,
} from "../visTools"
import { defaultOptions } from "../defaults"
import { splitText } from "../textProcess"
import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"
import { processImageData, processDistanceField } from "../processDistanceField"
import { processWords } from "../processWords"
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

// 展示文本预处理
console.log(`------------------------------------------------------`)
console.log("单词数量", words.length)
for (let i = 0; i < 10; i++) {
  console.log(words[i])
}
// 可视化 distance field
distanceVis(dist, options, outputDir)
// 可视化分组信息
groupVis(group, options, outputDir)
// 可视化轮廓识别信息
contourVis(contours, options, outputDir)
// 可视化极点提取信息
console.log(`------------------------------------------------------`)
console.log("regions 信息")
extremePointVis(dist, regions, options, outputDir)
// 可视化单词分配到region和极点结果
console.log(`------------------------------------------------------`)
console.log("keywords 分配信息")
allocateWordsVis(dist, regions, keywords, options, outputDir)
// 可视化螺旋线生成效果
spiralVis(dist, regions, options, outputDir)
