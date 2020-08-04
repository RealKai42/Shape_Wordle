import { createCanvas, createImageData } from "canvas"
import { ColorInterpolator } from "color-extensions"
import fs from "fs"
import { Options } from "./defaults"

const colours = [
  "#0081b4",
  "#e5352b",
  "#e990ab",
  "#ffd616",
  "#96cbb3",
  "#91be3e",
  "#39a6dd",
  "#eb0973",
  "#dde2e0",
  "#949483",
  "#f47b7b",
  "#9f1f5c",
  "#ef9020",
  "#00af3e",
  "#85b7e2",
  "#29245c",
  "#00af3e",
  "#ffffff",
]
const prefix = "VisTool_"

export function groupVis(groupData: number[][], options: Options, outputDir: string) {
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext("2d")

  // 用ImageData批量填充
  const imgData = createImageData(options.width, options.height)
  let img_i = 0
  const allGroupData = []
  for (let i = 0; i < groupData.length; i++) {
    for (let j = 0; j < groupData[i].length; j++) {
      if (allGroupData.indexOf(groupData[i][j]) === -1) allGroupData.push(groupData[i][j])
      const color = hexToRgb(colours[groupData[i][j]])
      imgData.data[img_i] = color[0]
      imgData.data[img_i + 1] = color[1]
      imgData.data[img_i + 2] = color[2]
      imgData.data[img_i + 3] = 255
      img_i += 4
    }
  }
  console.log("分组数据为", allGroupData)
  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer()

  fs.writeFileSync(`${outputDir}/${prefix}groupVis.png`, buf)
}

export function distanceVis(
  distData: number[][][],
  options: Options,
  outputDir: string,
  outputImage: boolean = true
) {
  // 获取最大最小值
  let max = -Infinity
  let min = Infinity
  for (let i of distData) {
    for (let j of i) {
      if (j[2] > max) max = j[2]
      if (j[2] < min) min = j[2]
    }
  }

  // 构建colormap
  const colorMap = {
    0: "#fff",
    // 1.0: "#0000ff"
    1.0: "#ff0000",
  }
  const interpolator = new ColorInterpolator(colorMap)

  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext("2d")
  const imgData = createImageData(options.width, options.height)
  for (let dis of distData) {
    for (let dist_i of dis) {
      const x = dist_i[1]
      const y = dist_i[0]
      const dist = dist_i[2]
      const i = (x * options.width + y) * 4
      const color = interpolator.getColor((dist - min) / (max - min), "object")
      imgData.data[i] = color.r
      imgData.data[i + 1] = color.g
      imgData.data[i + 2] = color.b
      imgData.data[i + 3] = 255
    }
  }

  if (outputImage) {
    ctx.putImageData(imgData, 0, 0)
    const buf = canvas.toBuffer()
    fs.writeFileSync(`${outputDir}/${prefix}distanceVis.png`, buf)
  }
  return imgData
}

export function contourVis(contourData: number[][][], options: Options, outputDir: string) {
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext("2d")
  const imgData = createImageData(options.width, options.height)
  for (let i in contourData) {
    for (let j of contourData[i]) {
      const x = j[1]
      const y = j[0]
      const imgData_i = (x * options.width + y) * 4
      const color = hexToRgb(colours[i])
      imgData.data[imgData_i] = color[0]
      imgData.data[imgData_i + 1] = color[1]
      imgData.data[imgData_i + 2] = color[2]
      imgData.data[imgData_i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer()
  fs.writeFileSync(`${outputDir}/${prefix}contourVis.png`, buf)
}

function hexToRgb(hex: string) {
  const rgb: number[] = []
  hex = hex.substr(1) //去除前缀 # 号
  if (hex.length === 3) {
    // 处理 "#abc" 成 "#aabbcc"
    hex = hex.replace(/(.)/g, "$1$1")
  }
  hex.replace(/../g, (color) => {
    rgb.push(parseInt(color, 0x10)) //按16进制将字符串转换为数字
    return color
  })
  // 返回的是rgb数组
  return rgb
}
