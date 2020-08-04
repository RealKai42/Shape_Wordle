import { preProcessImg } from "../imageProcess"
import { groupVis, distanceVis, contourVis } from "../visTools"
import { defaultOptions } from "../defaults"
import cv from "opencv4nodejs"
import fs from "fs"
import path from "path"

const dir = path.resolve(__dirname, "../../assets/")
const image = cv.imread(path.resolve(dir, "input1.png"))
testImageProcess(image)

function testImageProcess(image: cv.Mat) {
  const { dist, contour, group } = preProcessImg(image, defaultOptions)
  distanceVis(dist, defaultOptions, __dirname)
  groupVis(group, defaultOptions, __dirname)
  contourVis(contour, defaultOptions, __dirname)
}
