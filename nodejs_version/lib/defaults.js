const defaultOptions = {
  // canvas
  width: 900,
  height: 600,
  draw: true, // 是否绘制结果, true绘制结果返回图片, false返回单词坐标及相关信息
  backgroundTransparent: true, // 背景是否透明

  lemmatization: true, // 是否进行词性还原
  stopwords: true, // 是否启用停用词过滤
  filterNumber: true, // 是否过滤数字
  wordsNum: 60, // keyword 数量 

}

module.exports = {
  defaultOptions,
}
