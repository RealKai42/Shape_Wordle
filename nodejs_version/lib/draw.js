/**
 * drawFillingWords 与 drawKeywords 属于计算词云的一部分，返回用于绘制的信息
 * draw 方法用于展示、输出结果
 */

const { calcScreenMinFontSize } = require('./utils')
const { createCanvas } = require('canvas')


function draw(keywords, fillingWords, options) {
  const { width, height, fontWeight, fontFamily, resizeFactor } = options

  const canvas = createCanvas(width * resizeFactor, height * resizeFactor)
  const ctx = canvas.getContext('2d')

  keywords.forEach(({ color, fontSize, transX, transY, rotate, name, fillX, fillY }) => {
    ctx.save()
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`

    ctx.fillStyle = color
    ctx.translate(transX * resizeFactor, transY * resizeFactor)
    ctx.rotate(rotate)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabet'
    ctx.fillText(name, fillX * resizeFactor, fillY * resizeFactor)
    ctx.restore()
  })

  fillingWords.forEach(({ color, fontSize, transX, transY, rotate, name, fillX, fillY }) => {
    ctx.save()
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`

    ctx.fillStyle = color
    ctx.translate(transX * resizeFactor, transY * resizeFactor)
    ctx.rotate(rotate)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'middle'
    ctx.fillText(name, fillX * resizeFactor, fillY * resizeFactor)
    ctx.restore()
  })

  return canvas.toBuffer()
}



function drawKeywords(words, options) {
  const {
    maxFontSize,
    minFontSize,
  } = options
  return words.filter(word => word.state && word.position).map(word => ({
    name: word.name,
    fontSize: (maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize,
    color: word.color,
    rotate: word.angle,
    transX: word.position[0],
    transY: word.position[1],
    fillX: 0,
    fillY: word.height - word.descent - word.gap,
  }))
}

function drawFillingWords(keywords, fillingWords, group, options) {
  const {
    width: canvasWidth,
    height: canvasHeight,
    fillingFontSize,
    angleMode,
    fontFamily,
    maxFontSize,
    minFontSize,
  } = options
  const g = 1
  const settings = {
    rotateRatio: 0.5,
    gridSize: 6,
    minRotation: -Math.PI / 2,
    maxRotation: Math.PI / 2,
    ellipticity: 1,
  }
  const rotationRange = Math.abs(settings.maxRotation - settings.minRotation)
  const screenMinFontSize = calcScreenMinFontSize()
  const wordLayouts = []

  const isInShapePoint = point => group[point.y][Math.floor(point.x)] >= 2

  const seeBox = () => {
    //为了像素级overlap检测铺路的测试方法
    //获取格子状态，排除已经有单词的部分和Shape外的部分
    const grid = []
    const wordCanvas = createCanvas(canvasWidth, canvasHeight)
    const ctx = wordCanvas.getContext('2d')
    // 整个背景涂黑
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)
    ctx.beginPath()
    ctx.fillStyle = "#000000"
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    // 绘制所有keywords
    keywords.forEach(word => {
      if (word.state) {
        const [x, y] = word.position
        const { angle } = word

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle)
        ctx.lineWidth = 2
        ctx.strokeStyle = "green"
        const fontSize = (maxFontSize - minFontSize) * Math.sqrt(word.weight) + minFontSize
        ctx.font = `${fontSize}px ${word.fontFamily}`
        ctx.fillStyle = word.color
        ctx.textAlign = 'center'
        ctx.textBaseline = 'alphabet'
        ctx.strokeText(word.name, 0, word.height - word.descent - word.gap)
        ctx.fillText(word.name, 0, word.height - word.descent - word.gap)
        ctx.restore()
      }
    })

    const imageData = ctx.getImageData(0, 0, canvasWidth * g, canvasHeight * g).data

    const bgCtx = createCanvas(100, 100).getContext('2d')
    bgCtx.fillStyle = "#000000"
    bgCtx.fillRect(0, 0, 1, 1)
    const bgPixel = bgCtx.getImageData(0, 0, 1, 1).data


    let gx = ngx
    while (gx--) {
      grid[gx] = []
      let gy = ngy
      while (gy--) {
        let y = g
        singleGridLoop: while (y--) {
          let x = g
          while (x--) {
            let i = 4
            while (i--) {
              if ((imageData[((gy * g + y) * ngx * g + (gx * g + x)) * 4 + i] !== bgPixel[i])
                || !isInShapePoint({ x: (gx * g + x), y: (gy * g + y) })) {
                grid[gx][gy] = false
                break singleGridLoop
              }
            }
          }
        }
        if (grid[gx][gy] !== false) {
          grid[gx][gy] = true
        }
      }
    }

    return grid
  }

  const getRotateDeg = () => {
    // 根据设定的filling word mode 去返回角度
    if (angleMode == 2) {
      return Math.random() * (settings.maxRotation - settings.minRotation + 1) + settings.minRotation
    } else if (angleMode == 3) {
      return Math.PI / 4
    } else if (angleMode == 4) {
      return -Math.PI / 4
    } else if (angleMode == 5) {
      return Math.random() > 0.5 ? Math.PI / 4 : -Math.PI / 4
    } else {
      return Math.random() > settings.rotateRatio ? 0 : settings.minRotation + Math.floor(Math.random() * 2) * rotationRange
    }
  }

  const getTextInfo = (word, rotateDeg, fontSize) => {
    //这个方法是像素级Overlap检测的基础方法，能获得单词的像素排布信息
    // calculate the acutal font size
    // fontSize === 0 means weightFactor function wants the text skipped,
    // and size < minSize means we cannot draw the text.
    if (fontSize <= 0) return false

    // Scale factor here is to make sure fillText is not limited by
    // the minium font size set by browser.
    // It will always be 1 or 2n.
    //mu-缩放系数，为了确保字体不因为最小浏览器字体大小而受限
    let mu = 1
    if (fontSize < screenMinFontSize) {
      mu = 2
      while (mu * fontSize < screenMinFontSize) {
        mu += 2
      }
    }
    // fontWeight 决定字体权重
    const fontWeight = 'normal'
    let fcanvas = createCanvas(100, 100) // 临时画布, 辅助确定字体格子的
    let fctx = fcanvas.getContext('2d', { willReadFrequently: true })
    fctx.font = `${fontWeight} ${fontSize * mu}px ${fontFamily}`

    // Estimate the dimension of the text with measureText().
    const fw = fctx.measureText(word.name).width / mu //为什么要除以mu  --  因为后面要乘以mu
    const fh = Math.max(
      fontSize * mu,
      fctx.measureText('m').width,
      fctx.measureText('\uFF37').width
    ) / mu
    // Create a boundary box that is larger than our estimates,
    // so text don't get cut of (it sill might) //这个盒子建得比实际单词大得多
    const fgw = Math.ceil(fw + fh * 2 / g)//这个取宽度的方法莫名其妙
    const fgh = Math.ceil(fh * 3 / g)
    const boxWidth = fgw * g
    const boxHeight = fgh * g

    // Calculate the proper offsets to make the text centered at
    // the preferred position.

    // This is simply half of the width.
    const fillTextOffsetX = -fw / 2
    // Instead of moving the box to the exact middle of the preferred
    // position, for Y-offset we move 0.4 instead, so Latin alphabets look
    // vertical centered.
    const fillTextOffsetY = -fh * 0.4
    const cgh = Math.ceil((boxWidth * Math.abs(Math.sin(rotateDeg)) +
      boxHeight * Math.abs(Math.cos(rotateDeg))) / g)
    const cgw = Math.ceil((boxWidth * Math.abs(Math.cos(rotateDeg)) +
      boxHeight * Math.abs(Math.sin(rotateDeg))) / g)
    const width = cgw * g
    const height = cgh * g

    fcanvas = createCanvas(width, height)
    fctx = fcanvas.getContext('2d', { willReadFrequently: true })

    // Scale the canvas with |mu|.
    fctx.scale(1 / mu, 1 / mu)  //人家做了缩放，Emmmm，所以前面的不合理都成了合理
    fctx.translate(width * mu / 2, height * mu / 2)
    fctx.rotate(-rotateDeg)
    // Once the width/height is set, ctx info will be reset.
    // Set it again here.
    fctx.font = `${fontWeight} ${fontSize * mu}px ${fontFamily}`
    // Fill the text into the fcanvas.
    // XXX: We cannot because textBaseline = 'top' here because
    // Firefox and Chrome uses different default line-height for canvas.
    // Please read https://bugzil.la/737852#c6.
    // Here, we use textBaseline = 'middle' and draw the text at exactly
    // 0.5 * fontSize lower.
    fctx.fillStyle = '#000'
    fctx.textBaseline = 'middle'
    fctx.lineWidth = 1
    fctx.strokeStyle = "#000"
    fctx.strokeText(word.name, fillTextOffsetX * mu,
      (fillTextOffsetY + fontSize * 0.5) * mu)
    fctx.fillText(word.name, fillTextOffsetX * mu,
      (fillTextOffsetY + fontSize * 0.5) * mu)
    // Get the pixels of the text

    const imageData = fctx.getImageData(0, 0, width, height).data

    // Read the pixels and save the information to the occupied array
    const occupied = []
    let gx = cgw, gy, x, y
    const bounds = [cgh / 2, cgw / 2, cgh / 2, cgw / 2] //找到单词边界，初始先设定在中心
    while (gx--) {
      gy = cgh
      while (gy--) {
        y = g
        singleGridLoop: {
          //在一个格子内部按像素扫描
          while (y--) {
            x = g
            while (x--) {
              //ImageData 中的data属性为RGBA 分别代表红绿蓝+ Alpha(透明度)
              //gy*g+y 代表行，一行有width个像素点
              //通过判断Alpha有没有值判断这个像素是否被使用
              if (imageData[((gy * g + y) * width +
                (gx * g + x)) * 4 + 3]) {
                occupied.push([gx, gy])

                if (gx < bounds[3]) {
                  bounds[3] = gx
                }
                if (gx > bounds[1]) {
                  bounds[1] = gx
                }
                if (gy < bounds[0]) {
                  bounds[0] = gy
                }
                if (gy > bounds[2]) {
                  bounds[2] = gy
                }
                break singleGridLoop
              }
            }
          }
        }
      }
    }
    // Return information needed to create the text on the real canvas
    return {
      mu,
      occupied, //单词占据的格子
      bounds,//单词边界
      gw: cgw,//单词的网格宽度
      gh: cgh,//单词的网格高度
      fillTextOffsetX,//宽度上做了一个offset，为了绘图需要
      fillTextOffsetY,//高度上做了一个Offset，为了绘图需要
      fillTextWidth: fw,//半宽，canvas量出来的半宽
      fillTextHeight: fh,//半高，
      fontSize: fontSize
    }
  }

  const canFitText = (gx, gy, gw, gh, occupied, grid) => {
    // Go through the occupied points,
    // return false if the space is not available.
    let i = occupied.length
    while (i--) {
      var px = gx + occupied[i][0]
      var py = gy + occupied[i][1]

      if (px >= ngx || py >= ngy || px < 0 || py < 0) {
        return false
      }

      if (!grid[px][py]) {
        return false
      }
    }
    return true
  }

  const drawText = (gx, gy, info, word, rotateDeg, alpha, color) => {
    // 将单词的绘制信息返回
    const x = (gx + info.gw / 2) * g
    const y = (gy + info.gh / 2) * g
    return Math.floor(y) < canvasHeight && Math.floor(x) < canvasWidth ? {
      name: word,
      fontSize: info.fontSize,
      color,
      rotate: -rotateDeg,
      transX: x,
      transY: y,
      fillX: info.fillTextOffsetX,
      fillY: info.fillTextOffsetY + fontSize * 0.5,
    } : undefined
  }

  const updateGrid = (grid, gx, gy, info) => {
    // 根据新填充的filling word 更新格子
    const occupied = info.occupied

    let i = occupied.length
    while (i--) {
      const px = gx + occupied[i][0]
      const py = gy + occupied[i][1]

      if (px >= ngx || py >= ngy || px < 0 || py < 0) {
        continue
      }

      grid[px][py] = false
    }
  }

  const getSpiralNudgerCircle = (attempt, lim) => {
    // 获取螺旋线增量的方法
    // 估计是普通的螺旋线
    const rad = powerMap(0.5, attempt, 0, lim, 1, maxRadius)
    const thetaIncrement = powerMap(1, attempt, 0, lim, 0.5, 0.3)
    const theta = thetaIncrement * attempt
    const x = Math.cos(theta) * rad
    const y = Math.sin(theta) * rad
    return [x, y]
  }

  const powerMap = (power, v, min1, max1, min2, max2) => {
    const val = Math.pow(v / (max1 - min1), power)
    return (max2 - min2) * val + min2
  }

  const putWord = (word, fontSize, alpha, grid) => {
    // 放置filling word
    const rotateDeg = getRotateDeg()
    // 获取单词占据的格子啥的 各项属性
    const info = getTextInfo(word, rotateDeg, fontSize)

    if (!info) return false

    const tryToPutWordAtPoint = gxy => {
      //把要测试的单词的中心移动到测试点上

      // 每次放置filling之前，检测是否能放得下
      // 发得下就放下，并且更新grid
      const gx = Math.floor(gxy[0] - info.gw / 2)
      const gy = Math.floor(gxy[1] - info.gh / 2)
      const gw = info.gw
      const gh = info.gh

      // If we cannot fit the text at this position, return false
      // and go to the next position.
      if (!canFitText(gx, gy, gw, gh, info.occupied, grid)) {
        return false
      }

      // Actually put the text on the canvas
      const layout = drawText(gx, gy, info, word.name, rotateDeg, alpha, word.color)
      layout && wordLayouts.push(layout)

      // Mark the spaces on the grid as filled
      updateGrid(grid, gx, gy, info)

      // Return true so some() will stop and also return true.
      return true
    }


    const placeWord = () => {
      const xmax = canvasWidth / 2 + 50, xmin = canvasWidth / 2 - 50
      const ymax = canvasHeight / 2 + 50, ymin = canvasHeight / 2 - 50

      const x = Math.round(Math.random() * (xmax - xmin + 1) + xmin)
      const y = Math.round(Math.random() * (ymax - ymin + 1) + ymin)

      return [x, y]
    }
    const pos = placeWord()

    const lim = 12000
    for (let i = 0; i < lim; i++) {
      const nudge = getSpiralNudgerCircle(i, lim)
      pos[0] += nudge[0] / 2
      pos[1] += nudge[1] / 2

      const state = tryToPutWordAtPoint([Math.round(pos[0] / g), Math.round(pos[1] / g)])
      if (state) return true
    }

    return false
  }
  //ceil是上舍入
  const ngx = Math.ceil(canvasWidth / g)
  const ngy = Math.ceil(canvasHeight / g)
  const maxRadius = Math.floor(Math.sqrt(ngx * ngx + ngy * ngy) / 2)

  // 将canvas划分成格子，进行分布
  const grid = seeBox()

  let fontSize = fillingFontSize

  // 分几次填充单词，保证填充率
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.8, grid)
  })
  fontSize -= 2
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.7, grid)
  })
  fillingWords.forEach(word => {
    putWord(word, fontSize, 0.7, grid)
  })
  for (let _ = 0; _ < 3; _++) {
    fontSize -= 3
    fillingWords.forEach(word => {
      putWord(word, fontSize, 0.6, grid)
    })
    fillingWords.forEach(word => {
      putWord(word, fontSize, 0.6, grid)
    })
  }

  return wordLayouts
}



module.exports = {
  drawKeywords,
  drawFillingWords,
  draw,
}