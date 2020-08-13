import { Options } from "./interface"

export const defaultOptions: Options = {
  // canvas
  width: 900,
  height: 600,
  draw: true,
  backgroundTransparent: true,

  lemmatization: true,
  stopwords: true,
  filterNumber: true,
  keywordsNum: 60,
  angleMode: 5,
  language: "cn",
  baseOnAreaOrDisValue: true,
  isMaxMode: false,
  maxFontSize: 100,
  minFontSize: 2,

  keywordColor: "#000000",
  fillingWordColor: "#0000ff",
  fillingFontSize: 10,
  cnFontFamily: "siyuan",
  enFontFamily: "Hobo std",
  fontFamily: "",
  fontWeight: "normal",
  resizeFactor: 4,

  colors: [
    "#e5352b",
    "#e990ab",
    "#ffd616",
    "#96cbb3",
    "#91be3e",
    "#39a6dd",
    "#eb0973",
    "#dde2e0",
    "#949483",
    "#f47b7b",
    "#9f1f5c",
    "#ef9020",
    "#00af3e",
    "#85b7e2",
    "#29245c",
    "#00af3e",
  ],
  eps: 0.0000001,

  // 调试参数
  debug: false,
}
