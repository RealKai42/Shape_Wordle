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
import { defaultOptions, Options } from "./defaults"
import { processImageData, processDistanceField, region } from "./processDistanceField"
import { splitText } from "./textProcess"
import { processWords, keyword } from "./processWords"
import { allocateWords } from "./allocateWords"

const options = defaultOptions

const imageFilename = path.resolve(__dirname, "../assets/input1.png")
const textFilename = path.resolve(__dirname, "../assets/demo_text_en.txt")
const image = cv.imread(imageFilename, cv.IMREAD_UNCHANGED)
const { dist: distRaw, contours, group: groupRaw, areas } = preProcessImg(image, options)
const { dist, group } = processImageData(distRaw, groupRaw, options)
const regions = processDistanceField(dist, contours, areas)

const text = fs.readFileSync(textFilename, "utf-8")
const words = splitText(text, options)
const { keywords, fillingWords } = processWords(words, options)
allocateWords(keywords, regions, areas, options)
