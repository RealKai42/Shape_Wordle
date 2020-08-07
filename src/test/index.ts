import { preProcessImg } from "../imageProcess"
import { groupVis, distanceVis, contourVis } from "../visTools"
import { defaultOptions } from "../defaults"
import { splitText } from "../textProcess"
import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"

const dir = path.resolve(__dirname, "../../assets/")
const image = cv.imread(path.resolve(dir, "input1.png"))
const text = fs.readFileSync(path.resolve(dir, "complex_text_en.txt"), "utf-8")

// testImageProcess(image)·
testTextProcess(text)

function testImageProcess(image: cv.Mat) {
  const { dist, contour, group } = preProcessImg(image, defaultOptions)
  const outputDir = path.resolve(__dirname, "imageProcess")
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }

  distanceVis(dist, defaultOptions, outputDir)
  groupVis(group, defaultOptions, outputDir)
  contourVis(contour, defaultOptions, outputDir)
}

function testTextProcess(text: string) {
  const result = splitText(text, defaultOptions)
  console.log("length", result.length)
  // Array.prototype.forEach.call(result.slice(10), (x) => console.log(x))
  console.log(result.slice(10))
}
