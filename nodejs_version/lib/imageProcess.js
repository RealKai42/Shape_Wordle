/**
 * 对图形进行预处理, 返回distanceField group contour 信息
 */

const cv = require('opencv4nodejs')

function preProcessImg(image, options) {
  const cuttedImage = cutImage(image, options)
  const groupData = getGroup(cuttedImage, options)
  const [distData, contourData] = getDistAndContour(groupData)
  return { 'dist': distData, 'contour': contourData, 'group': groupData }
}

function getGroup(image, options) {
  gray = image.cvtColor(cv.COLOR_BGR2GRAY)
  const thresh = gray.threshold(0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU)
  // 开运算, 去除图像中的小亮点、噪声
  const kernel = new cv.Mat(3, 3, cv.CV_8UC1, 1);
  const opening = thresh.morphologyEx(kernel, cv.MORPH_OPEN, { iteration: 2 })
  // 确定背景区域
  const background = opening.dilate(kernel, { iterations: 3 })
  // 寻找前景区域
  const distanceTrans = opening.distanceTransform(cv.DIST_L2, 5)
  const disPara = 0.7
  let sure_fg = distanceTrans.threshold(disPara * getMaxValue(distanceTrans.getDataAsArray()), 255, 0)
  sure_fg = sure_fg.convertTo(cv.CV_8UC1)
  // 找到未知区域
  const unknown = background.sub(sure_fg)
  // 类别标记
  let markers = sure_fg.connectedComponents()
  let markersData = markers.getDataAsArray()
  // 为所有的标记加1，保证背景是0而不是1
  markersData = markersData.map(item => {
    return newItem = item.map(i => i + 1)
  })
  // 让所有的未知区域为0
  const unknownData = unknown.getDataAsArray()
  for (let i = 0; i < markersData.length; i++) {
    for (let j = 0; j < markersData[i].length; j++) {
      if (unknownData[i][j] === 255)
        markersData[i][j] = 0
    }
  }
  // 转换矩阵格式
  markers = new cv.Mat(markersData, cv.CV_32SC1)
  // 运行分区算法
  markers = image.watershed(markers)
  markersData = markers.getDataAsArray()
  // 对背景区域由-1转换成1
  markersData = markersData.map(item => {
    return newItem = item.map(i => i === -1 ? 1 : i)
  })
  return markersData
}

function getDistAndContour(groupData) {
  let markers = JSON.parse(JSON.stringify(groupData))
  // 将markers中背景设置为0, 非背景设置为1
  markers = markers.map(item => {
    return newItem = item.map(i => i === 1 ? 0 : 1)
  })
  // 获取distance field
  const newImage = new cv.Mat(markers, cv.CV_8UC1)
  const distImg = newImage.distanceTransform(cv.DIST_L2, cv.DIST_MASK_5)
  // 将distance field中背景部分替换成-1
  let distData = distImg.getDataAsArray()
  for (let i = 0; i < distData.length; i++) {
    for (let j = 0; j < distData[i].length; j++) {
      if (markers[i][j] == 0)
        distData[i][j] = -1
    }
  }
  // 获取contour
  const contour = newImage.findContours(cv.RETR_TREE, cv.CHAIN_APPROX_TC89_KCOS)
  // console.log(contour[0].getPoints()[0].x)
  // 处理contour数据
  let contourData = []
  for (let i in contour) {
    contourData.push([])
    for (j of contour[i].getPoints()) {
      contourData[i].push([j.x, j.y])
    }
  }
  return [distData, contourData]
}

function cutImage(image, options) {
  let height = image.sizes[0]
  let width = image.sizes[1]
  // 处理含Alpha通道的图片, 将Alpha通道为0的转换为白色背景
  if (image.channels === 4) {
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width; col++) {
        if (gray.at(row, col).w === 0) {
          gray.set(row, col, new Vec(255, 255, 255, 1));
          // image.set(row, col, new Vec(0, 0, 0, 1))
        }
      }
    }
    gray = gray.cvtColor(cv.COLOR_BGRA2BGR)
  }
  gray = image.cvtColor(cv.COLOR_BGR2GRAY)
  // 切割原图
  let top = 0
  let bottom = 0
  let left = 0
  let right = 0
  const threshold = 250

  cutAnchor1:
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (gray.at(row, col) <= threshold) {
        top = row
        break cutAnchor1
      }
    }
  }
  cutAnchor2:
  for (let col = 0; col < width; col++) {
    for (let row = 0; row < height; row++) {
      if (gray.at(row, col) <= threshold) {
        left = col
        break cutAnchor2
      }
    }
  }
  cutAnchor3:
  for (let col = width - 1; col >= 0; col--) {
    for (let row = 0; row < height; row++) {
      if (gray.at(row, col) <= threshold) {
        right = col
        break cutAnchor3
      }
    }
  }
  cutAnchor4:
  for (let row = height - 1; row >= 0; row--) {
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
  const ratio = 0.9  // 图片占canvas的比例
  let scale = (options.width * ratio) / width
  if (height * scale > (options.height * ratio)) {
    scale = (options.height * ratio) / height
  }

  height = parseInt(height * scale)
  width = parseInt(width * scale)
  image = image.resize(height, width)

  // 转换到目标宽高, 使用 getDataAsArray
  // let imageArray = image.getDataAsArray()
  // const newImage = new cv.Mat(options.height, options.width, cv.CV_8UC1, 255)
  // newImageArray = newImage.getDataAsArray()
  // const startRow = parseInt((options.height - height) / 2)
  // const startCol = parseInt((options.width - width) / 2)
  // for (let row = startRow, iRow = 0; iRow < height; row++, iRow++) {
  //   for (let col = startCol, iCol = 0; iCol < width; col++, iCol++) {
  //     newImageArray[row][col] = imageArray[iRow][iCol]
  //   }
  // }
  // image = new cv.Mat(newImageArray, cv.CV_8UC1)

  // 转换到目标宽高
  const newImage = new cv.Mat(options.height, options.width, cv.CV_8UC3, [255, 255, 255])
  const startRow = parseInt((options.height - height) / 2)
  const startCol = parseInt((options.width - width) / 2)
  for (let row = startRow, iRow = 0; iRow < height; row++, iRow++) {
    for (let col = startCol, iCol = 0; iCol < width; col++, iCol++) {
      newImage.set(row, col, image.at(iRow, iCol))
    }
  }
  return newImage
}

function getMaxValue(arr) {
  // var newArray = arr.join(",").split(",");
  // return Math.max.apply({}, newArray);
  let max = -Infinity
  for (let i in arr) {
    for (let j in i) {
      max = j > max ? j : max
    }
  }
  return max
}

module.exports = {
  preProcessImg
}