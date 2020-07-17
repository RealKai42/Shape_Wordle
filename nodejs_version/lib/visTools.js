/**
 * 可视化工具
 */
const { createCanvas, createImageData } = require('canvas')
const { ColorInterpolator } = require("color-extensions");
const fs = require('fs')

const colours = ['#0081b4', '#e5352b', '#e990ab', '#ffd616', '#96cbb3', '#91be3e', '#39a6dd', '#eb0973', '#dde2e0', '#949483', '#f47b7b',
  '#9f1f5c', '#ef9020', '#00af3e', '#85b7e2', '#29245c', '#00af3e', '#ffffff'];
const prefix = 'output/VisTool_'

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
      const color = hexToRgb(colours[groupData[i][j]])
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

  fs.writeFileSync(`${outputDir}/${prefix}groupVis.png`, buf);
}

function distanceVis(distData, options, outputDir) {
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
    1.0: "#ff0000"
  };
  const interpolator = new ColorInterpolator(colorMap);

  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')
  const imgData = createImageData(options.width, options.height)
  for (let dis of distData) {
    for (let dist_i of dis) {
      const x = dist_i[1]
      const y = dist_i[0]
      const dist = dist_i[2]
      const i = ((x * options.width) + y) * 4
      const color = interpolator.getColor((dist - min) / (max - min), 'object')
      imgData.data[i] = color.r
      imgData.data[i + 1] = color.g
      imgData.data[i + 2] = color.b
      imgData.data[i + 3] = 255
    }
  }

  ctx.putImageData(imgData, 0, 0)
  const buf = canvas.toBuffer();
  fs.writeFileSync(`${outputDir}/${prefix}distanceVis.png`, buf);
  return imgData
}

function contourVis(contourData, options, outputDir) {
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')
  const imgData = createImageData(options.width, options.height)
  for (let i in contourData) {
    for (let j of contourData[i]) {
      const x = j[1]
      const y = j[0]
      const imgData_i = ((x * options.width) + y) * 4
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

function extremePointVis(distData, regions, options, outputDir, drawText = true, outputInfo = true) {
  const distanceImageData = distanceVis(distData, options, outputDir)
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')
  ctx.putImageData(distanceImageData, 0, 0)
  // console.log(regions.map(region => region.extremePoints))
  regions.forEach(region => {
    const points = region.extremePoints
    points.forEach((point, epID) => {
      if (outputInfo)
        console.log(`regionID:${point.regionID} epID: ${epID}\n`, point)
      ctx.beginPath()
      ctx.arc(point.pos[0], point.pos[1], 3, 0, 360)
      ctx.fillStyle = 'yellow'
      ctx.fill()
      ctx.closePath()

      if (drawText) {
        ctx.font = '15px Arial';
        ctx.fillStyle = 'black'
        let info = `
        value: ${point.value}
        regionID:${point.regionID}
        epID:${epID}
        `
        const width = ctx.measureText(info).actualBoundingBoxRight
        ctx.fillText(info, point.pos[0] - width, point.pos[1]);
      }
    })
  })
  const ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const buf = canvas.toBuffer()
  fs.writeFileSync(`${outputDir}/${prefix}extremePointVis.png`, buf)
  return ImageData
}

function allocateWordsVis(distData, regions, keywords, options, outputDir) {
  let epImageData = distanceVis(distData, options, outputDir)
  const canvas = createCanvas(options.width, options.height)
  const ctx = canvas.getContext('2d')
  ctx.putImageData(epImageData, 0, 0)
  regions.forEach(region => {
    const points = region.extremePoints
    points.forEach((point, epID) => {
      ctx.beginPath()
      ctx.arc(point.pos[0], point.pos[1], 3, 0, 360)
      ctx.fillStyle = 'yellow'
      ctx.fill()
      ctx.closePath()
    })
  })
  epImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  regions.forEach(region => {
    const points = region.extremePoints
    points.forEach((point, epID) => {
      ctx.font = '15px Arial';
      ctx.fillStyle = 'black'
      let info = `value: ${point.value}\nnumber:${point.epNumber}\nregionID:${point.regionID}\nepID:${epID}`
      const width = ctx.measureText(info).actualBoundingBoxRight
      ctx.fillText(info, point.pos[0] - width, point.pos[1])
    })
  })
  let buf = canvas.toBuffer()
  fs.writeFileSync(`${outputDir}/${prefix}allocateWordsVis_Numbers.png`, buf)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.putImageData(epImageData, 0, 0)
  regions.forEach((region, regionID) => {
    const points = region.extremePoints
    points.forEach((point, epID) => {
      ctx.font = '10px Arial'
      ctx.fillStyle = 'black'
      let info = ''
      keywords.forEach(word => {
        if (word.regionID === regionID && word.epID === epID) {
          info += `${word.name},${word.weight}\n`
        }
      })
      console.log(`regionID:${regionID} epID${epID} words: ${info.replace(/\n/g, '  ')}`)
      const width = ctx.measureText(info).actualBoundingBoxRight
      ctx.fillText(info, point.pos[0] - width, point.pos[1])
    })
  })




  buf = canvas.toBuffer()
  fs.writeFileSync(`${outputDir}/${prefix}allocateWordsVis_words.png`, buf)
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

module.exports = {
  groupVis,
  distanceVis,
  contourVis,
  extremePointVis,
  allocateWordsVis,
}