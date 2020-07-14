/**
 * 用canvas把Distance Field数据进行可视化
 *
 * 主要用于测试将图像分割成Distance Field的代码
 * dis的文件格式是新版的,width*height 的数组
 */
const { ColorInterpolator } = require("color-extensions");
const { createCanvas, createImageData } = require('canvas')

const canvas_width = 900
const canvas_height = 600

function distanceVis(disData) {
  // 获取最大最小值
  let max = -Infinity
  let min = Infinity
  for (let i of disData) {
    for (let j of i) {
      if (j > max) max = j
      if (j < min) min = j
    }
  }

  // 构建colormap
  const colorMap = {
    0: "#fff",
    // 1.0: "#0000ff"
    1.0: "#ff0000"
  };
  const interpolator = new ColorInterpolator(colorMap);

  const canvas = createCanvas(canvas_width, canvas_height)
  const ctx = canvas.getContext('2d')
  const imgData = createImageData(canvas_width, canvas_height)
  let img_i = 0
  for (let i = 0; i < disData.length; i++) {
    for (let j = 0; j < disData[i].length; j++) {
      const dist = disData[i][j]
      if (dist === -1) {
        imgData.data[img_i] = 0
        imgData.data[img_i + 1] = 0
        imgData.data[img_i + 2] = 0
        imgData.data[img_i + 3] = 0
      } else {
        const color = interpolator.getColor((dist - min) / (max - min), 'object')
        imgData.data[img_i] = color.r
        imgData.data[img_i + 1] = color.g
        imgData.data[img_i + 2] = color.b
        imgData.data[img_i + 3] = 255
      }
      img_i += 4
    }
  }
  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer();
  const fs = require('fs')
  fs.writeFileSync("distVis.png", buf);
}

module.exports = distanceVis

// const fs = require('fs')
// const disData = JSON.parse(fs.readFileSync(filename))
// distanceVis(disData)