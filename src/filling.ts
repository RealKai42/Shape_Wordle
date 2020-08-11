import { keyword, fillingword, Options } from "./interface"
import { twoDimenArray } from "./helper"
export function allocateFillingWords(
  keywords: keyword[],
  fillingwords: fillingword[],
  group: twoDimenArray,
  options: Options
) {
  const {
    width: canvasWidth,
    height: canvasHeight,
    fillingFontSize,
    angleMode,
    fontFamily,
    maxFontSize,
    minFontSize,
    fontWeight,
    fillingWordColor,
  } = options
}
