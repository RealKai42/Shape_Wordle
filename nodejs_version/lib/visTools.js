/**
 * 可视化工具
 */
const { createCanvas, createImageData } = require('canvas')
const { ColorInterpolator } = require("color-extensions");

const colours = ['#0081b4', '#e5352b', '#e990ab', '#ffd616', '#96cbb3', '#91be3e', '#39a6dd', '#eb0973', '#dde2e0', '#949483', '#f47b7b',
  '#9f1f5c', '#ef9020', '#00af3e', '#85b7e2', '#29245c', '#00af3e', '#ffffff'];

function groupVis(groupData, options, outputDir) {
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')

  // 用ImageData批量填充
  const imgData = createImageData(options.width, options.height)
  let img_i = 0
  const allGroupData = []
  for (let i = 0; i < groupData.length; i++) {
    for (let j = 0; j < groupData[i].length; j++) {
      if (allGroupData.indexOf(groupData[i][j]) === -1)
        allGroupData.push(groupData[i][j])
      const color = hexToRgb(colours[groupData[i][j] + 1])
      imgData.data[img_i] = color[0]
      imgData.data[img_i + 1] = color[1]
      imgData.data[img_i + 2] = color[2]
      imgData.data[img_i + 3] = 255
      img_i += 4
    }
  }
  console.log('分组数据为', allGroupData)
  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer();
  const fs = require('fs')
  fs.writeFileSync(outputDir + '/groupVis.png', buf);
}

var hexToRgb = function (hex) {
  var rgb = [];
  hex = hex.substr(1); //去除前缀 # 号
  if (hex.length === 3) {
    // 处理 "#abc" 成 "#aabbcc"
    hex = hex.replace(/(.)/g, '$1$1');
  }
  hex.replace(/../g, function (color) {
    rgb.push(parseInt(color, 0x10)); //按16进制将字符串转换为数字
  });
  // 返回的是rgb数组
  return rgb;
};

function distanceVis(distData, options, outputDir) {
  // 获取最大最小值
  let max = -Infinity
  let min = Infinity
  for (let i of distData) {
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

  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')
  const imgData = createImageData(options.width, options.height)
  let img_i = 0
  for (let i = 0; i < distData.length; i++) {
    for (let j = 0; j < distData[i].length; j++) {
      const dist = distData[i][j]
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
  fs.writeFileSync(outputDir + '/distanceVis.png', buf);
}

module.exports = {
  groupVis,
  distanceVis,
}