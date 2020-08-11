import { twoDimenArray } from "./helper"

export interface extremePoint {
  pos: number[]
  value: number
  regionID: number
  ratio?: number
  epWeight?: number
  epNumber?: number
}

export interface region {
  contour: number[][]
  dist: twoDimenArray
  extremePoints: extremePoint[]
  value?: number
  area?: number
  wordsNum?: number
  wordsWeight?: number
}

export interface keyword {
  name: string
  weight: number
  color: string
  fontFamily: string
  fontWeight: string | number
  fontSize?: number
  angle?: number
  position?: number[]
  regionID?: number
  epID?: number
  box?: number[][]
  width?: number
  height?: number
  ascent?: number
  descent?: number
  gap?: number
  state?: boolean
}

export interface fillingword {
  name: string
  weight: number
  color: string
}

export interface WordCounter {
  [key: string]: number
}
export interface Word {
  name: string
  weight: number
}

export type Options = {
  readonly width: number
  readonly height: number
  readonly draw: boolean // 是否绘制结果, true绘制结果返回图片, false返回单词坐标及相关信息
  readonly backgroundTransparent: boolean // 背景是否透明

  readonly lemmatization: boolean // 是否进行词性还原
  readonly stopwords: boolean // 是否启用停用词过滤
  readonly filterNumber: boolean // 是否过滤数字
  readonly keywordsNum: number // keyword 数量
  readonly angleMode: number // 角度模式，0-全横，1-横竖，2-random，3-45度向上\\，4-45度向下//，5-45度向上以及向下/\\/
  language: string // 仅支持中英，在textProcess会自动修改
  readonly baseOnAreaOrDisValue: boolean // 分配单词到region时根据面积还是根据distance value
  readonly isMaxMode: boolean // true之后，会不考虑数据的真实度，尽可能放大单词以填充区域
  maxFontSize: number // 在算法中会动态修改
  minFontSize: number

  readonly keywordColor: string
  readonly fillingWordColor: string
  readonly fillingFontSize: number
  readonly cnFontFamily: string
  readonly enFontFamily: string
  fontFamily: string // 动态修改
  readonly fontWeight: string
  readonly resizeFactor: number
  // 各region单词的颜色
  readonly colors: string[]
  readonly eps: number

  // 调试参数
  readonly debug: false
}
