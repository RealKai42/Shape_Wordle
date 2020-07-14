/**
 * 可视化标准img_process的结果
 * {dist, contour, group}
 */
const groupVis = require('./groupVis')
const distanceVis = require('./distanceVis2')

const fs = require('fs')
const { dist, contour, group } = JSON.parse(fs.readFileSync('info.json'))
groupVis(group)
distanceVis(dist)