class ShapeWordle {
  userOptions: object
  constructor(options = {}) {
    this.userOptions = options
  }
}

import fs from "fs"
import cv from "opencv4nodejs"
import path from "path"
import { preProcessImg } from "./imageProcess"
import { defaultOptions } from "./defaults"
import { processImageData, processDistanceField } from "./processDistanceField"

const image_filename = path.resolve(__dirname, "../assets/input1.png")
const image = cv.imread(image_filename, cv.IMREAD_UNCHANGED)
const { dist: distRaw, contours, group: groupRaw, area } = preProcessImg(image, defaultOptions)
const { dist, group } = processImageData(distRaw, groupRaw, defaultOptions)
const regions = processDistanceField(dist, contours)
