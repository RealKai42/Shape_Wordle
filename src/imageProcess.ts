import cv, { imshow, Vec4 } from "opencv4nodejs"
import { Options } from "./defaults"
import { twoDimenArray, Timer } from "./helper"
import { groupVis } from "./visTools"

export function preProcessImg(image: cv.Mat, options: Options): void {
  const cuttedImage = cutImage(image, options)
  const groupData = getGroup(cuttedImage)
  groupVis(groupData, options, "test")
}

/**
 * 使用watershed算法进行分区
 * @param image
 * @param Options
 */
function getGroup(image: cv.Mat) {
  const gray = image.cvtColor(cv.COLOR_BGR2GRAY)
  const thresh = gray.threshold(0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
  const components = thresh.connectedComponents()
  return components.getDataAsArray()
}

/**
 * 将透明背景处理为白色，裁剪输入图片到目标大小
 * @param image
 * @param options
 */
function cutImage(image: cv.Mat, options: Options): cv.Mat {
  let height = image.sizes[0],
    width = image.sizes[1]
  const { width: canvasWidth, height: canvasHeight } = options

  if (image.channels === 4) {
    const [, , , alpha] = image.splitChannels()
    const mask = alpha.threshold(254, 255, cv.THRESH_BINARY).bitwiseNot()
    image = image.setTo(new Vec4(255, 255, 255, 1), mask).cvtColor(cv.COLOR_BGRA2BGR)
  }
  // 使用灰度图对图片进行切割
  const gray = image.cvtColor(cv.COLOR_BGR2GRAY)
  let top = 0
  let bottom = 0
  let left = 0
  let right = 0
  const threshold = 250

  cutAnchor1: for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (gray.at(row, col) <= threshold) {
        top = row
        break cutAnchor1
      }
    }
  }
  cutAnchor2: for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      if (gray.at(row, col) <= threshold) {
        left = col
        break cutAnchor2
      }
    }
  }
  cutAnchor3: for (let col = width - 1; col >= 0; col--) {
    for (let row = 0; row < height; row++) {
      if (gray.at(row, col) <= threshold) {
        right = col
        break cutAnchor3
      }
    }
  }
  cutAnchor4: for (let row = height - 1; row >= 0; row--) {
    for (let col = 0; col < width; col++) {
      if (gray.at(row, col) <= threshold) {
        bottom = row
        break cutAnchor4
      }
    }
  }

  image = image.getRegion(new cv.Rect(left, top, right - left, bottom - top))
  height = image.sizes[0]
  width = image.sizes[1]

  // 确定缩放的scale
  const ratio = 0.9 // 图片占canvas的比例
  let scale = (canvasWidth * ratio) / width
  if (height * scale > canvasHeight * ratio) {
    scale = (canvasHeight * ratio) / height
  }
  height = Math.floor(height * scale)
  width = Math.floor(width * scale)
  image = image.resize(height, width)

  // 转换到目标宽高
  const newImage = new cv.Mat(canvasHeight, canvasWidth, cv.CV_8UC3, [255, 255, 255])
  const startRow = Math.floor((canvasHeight - height) / 2)
  const startCol = Math.floor((canvasWidth - width) / 2)
  image.copyTo(newImage.getRegion(new cv.Rect(startCol, startRow, width, height)))
  return newImage
}
