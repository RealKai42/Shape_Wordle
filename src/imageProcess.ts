import cv, { imshow, Vec4 } from "opencv4nodejs"
import { Options } from "./defaults"

export function preProcessImg(image: cv.Mat, options: Options) {
  const cuttedImage = cutImage(image, options)
  const groupData = getGroup(cuttedImage)
  const { distData, contourData, areaData } = getGroupInfo(groupData, options)
  return { dist: distData, contour: contourData, group: groupData, area: areaData }
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
 * 获取每个分组的Distance Field、Contour、Area等信息
 * @param group
 */
function getGroupInfo(markers: number[][], options: Options) {
  const { width, height } = options
  // 获取所有分组，去除背景0
  const labels = unique(markers.flat()).splice(1)
  const distData: number[][][] = []
  const contourData: number[][][] = []
  const areaData: number[] = []

  labels.forEach(label => {
    // 复制一个新markers, 非该次处理的分组设置为0，该次处理的设置为1
    const newMarkers = markers.map(item => {
      return item.map(i => (i === label ? 1 : 0))
    })
    // 获取distance field
    const newImage = new cv.Mat(newMarkers, cv.CV_8UC1)
    const distImg = newImage.distanceTransform(cv.DIST_L2, cv.DIST_MASK_3)
    distData.push([])
    const distData_i = label - 1
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (distImg.at(y, x) !== 0) {
          distData[distData_i].push([x, y, distImg.at(y, x)])
        }
      }
    }
    // 获取contour
    const contour = newImage.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_TC89_KCOS)
    // 处理contour数据
    contourData.push([])
    let area = 0
    for (let i in contour) {
      area += Math.floor(contour[i].area)
      for (let j of contour[i].getPoints()) {
        contourData[distData_i].push([j.x, j.y])
      }
    }
    areaData.push(area)
  })
  return { distData, contourData, areaData }
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

function unique(arr: number[]) {
  return Array.from(new Set(arr))
}
