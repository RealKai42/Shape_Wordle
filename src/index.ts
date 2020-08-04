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

const image_filename = path.resolve(__dirname, "../assets/input2.png")
const image = cv.imread(image_filename, cv.IMREAD_UNCHANGED)
preProcessImg(image, defaultOptions)
