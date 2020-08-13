import fs from "fs"
import cv from "opencv4nodejs"
import path from "path"
import { preProcessImg } from "./imageProcess"
import { defaultOptions } from "./defaults"
import { Options, region, keyword } from "./interface"
import { processImageData, processDistanceField } from "./processDistanceField"
import { splitText } from "./textProcess"
import { processWords } from "./processWords"
import { allocateWords } from "./allocateWords"
import { generateWordle } from "./wordle"
import { generateRenderableKeywords, allocateFillingWords } from "./filling"
import { draw } from "./draw"

export class ShapeWordle {
  userOptions: object
  constructor(options = {}) {
    this.userOptions = options
  }
  generate(text: string, image: cv.Mat) {
    const options = {
      ...defaultOptions,
      ...this.userOptions,
    }

    const words = splitText(text, options)
    const { keywords, fillingWords } = processWords(words, options)

    const { dist: distRaw, contours, group: groupRaw, areas } = preProcessImg(image, options)
    const { dist, group } = processImageData(distRaw, groupRaw, defaultOptions)
    const regions = processDistanceField(dist, contours, areas)
    allocateWords(keywords, regions, areas, options)
    generateWordle(keywords, regions, group, options)
    const renderableKeywords = generateRenderableKeywords(keywords)
    const renderableFillingWords = allocateFillingWords(keywords, fillingWords, group, options)

    const outimage = draw(renderableKeywords, renderableFillingWords, options)
    return outimage
  }
}
