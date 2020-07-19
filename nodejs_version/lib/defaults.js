const defaultOptions = {
  // canvas
  width: 900,
  height: 600,
  draw: true, // 是否绘制结果, true绘制结果返回图片, false返回单词坐标及相关信息
  backgroundTransparent: true, // 背景是否透明

  lemmatization: true, // 是否进行词性还原
  stopwords: true, // 是否启用停用词过滤
  filterNumber: true, // 是否过滤数字
  keywordsNum: 60, // keyword 数量 
  angleMode: 0, // 角度模式，0-全横，1-横竖，2-random，3-45度向上\\，4-45度向下//，5-45度向上以及向下/\\/
  language: 'cn', // 仅支持中英，在textProcess会自动修改
  baseOnAreaOrDisValue: true, // 分配单词到region时根据面积还是根据distance value
  isMaxMode: false, // true之后，会不考虑数据的真实度，尽可能放大单词以填充区域
  maxFontSize: 100, // 在算法中会动态修改
  minFontSize: 2,

  keywordColor: '#000000',
  fillingWordColor: '#ff0000',
  fillingFontSize: 10,
  cnFontFamily: 'siyuan',
  enFontFamily: 'Hobo std',
  fontWeight: 'normal',
  resizeFactor: 4,
  // 各region单词的颜色
  colors: [
    '#000000',
    '#e5352b',
    '#e990ab',
    '#ffd616',
    '#96cbb3',
    '#91be3e',
    '#39a6dd',
    '#eb0973',
    '#dde2e0',
    '#949483',
    '#f47b7b',
    '#9f1f5c',
    '#ef9020',
    '#00af3e',
    '#85b7e2',
    '#29245c',
    '#00af3e',
  ],
  eps: 0.0000001,


  // 调试参数
  debug: false,
}

module.exports = {
  defaultOptions,
}
