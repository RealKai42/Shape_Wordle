/**
 * 用canvas把Distance Field数据进行可视化
 *
 * 主要用于测试将图像分割成Distance Field的代码
 * dis的文件格式是原版的[x, y dis]
 */
const { ColorInterpolator } = require("color-extensions");
const { createCanvas, createImageData } = require('canvas')

const canvas_width = 900
const canvas_height = 600

function distanceVis(filename) {
  const fs = require('fs')
  const disData = JSON.parse(fs.readFileSync(filename))
  // 获取最大最小值
  let max = -Infinity
  let min = Infinity
  for (let dist of disData.dis) {
    for (let i of dist) {
      if (i[2] > max) max = i[2]
      if (i[2] < min) min = i[2]
    }
  }

  // 构建colormap
  const colorMap = {
    0: "#ff0000",
    // 1.0: "#0000ff"
    1.0: "#fff"
  };
  const interpolator = new ColorInterpolator(colorMap);

  const canvas = createCanvas(canvas_width, canvas_height)
  const ctx = canvas.getContext('2d')
  const imgData = createImageData(canvas_width, canvas_height)
  for (let dis of disData.dis) {
    for (let dist_i of dis) {
      const x = dist_i[1]
      const y = dist_i[0]
      const dist = dist_i[2]
      const i = ((x * canvas_width) + y) * 4
      const color = interpolator.getColor((dist - min) / (max - min), 'object')
      imgData.data[i] = color.r
      imgData.data[i + 1] = color.g
      imgData.data[i + 2] = color.b
      imgData.data[i + 3] = 255
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer();
  fs.writeFileSync("distVis.png", buf);
}
