import { preProcessImg } from "../imageProcess"
import { groupVis, distanceVis, contourVis, extremePointVis } from "../visTools"
import { defaultOptions, Options } from "../defaults"
import { splitText } from "../textProcess"
import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"
import { processImageData, processDistanceField } from "../processDistanceField"

const dir = path.resolve(__dirname, "../../assets/")
const image = cv.imread(path.resolve(dir, "input2.png"), cv.IMREAD_UNCHANGED)
const text = fs.readFileSync(path.resolve(dir, "demo_text_en.txt"), "utf-8")

testImageProcess(image)
testTextProcess(text)

function testImageProcess(image: cv.Mat) {
  const { dist: distRaw, contours, group: groupRaw } = preProcessImg(image, defaultOptions)
  const { dist, group } = processImageData(distRaw, groupRaw, defaultOptions)
  const regions = processDistanceField(dist, contours)
  const outputDir = path.resolve(__dirname, "imageProcess")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  distanceVis(dist, defaultOptions, outputDir)
  groupVis(group, defaultOptions, outputDir)
  contourVis(contours, defaultOptions, outputDir)
  console.log(`------------------------------------------------------`)
  console.log("regions 信息")
  extremePointVis(dist, regions, defaultOptions, outputDir)
}

function testTextProcess(text: string) {
  const result = splitText(text, defaultOptions)
  console.log(`------------------------------------------------------`)
  console.log("单词数量", result.length)
  for (let i = 0; i < 10; i++) {
    console.log(result[i])
  }
}
