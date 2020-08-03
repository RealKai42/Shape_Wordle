class ShapeWordle {
  userOptions: object
  constructor(options = {}) {
    this.userOptions = options
  }
}

import fs from "fs"
import cv from "opencv4nodejs"
import { preProcessImg } from "./imageProcess"
import { defaultOptions } from "./defaults"

const image_filename = __dirname + "/input3.png"
const image = cv.imread(image_filename, cv.IMREAD_UNCHANGED)
preProcessImg(image, defaultOptions)
