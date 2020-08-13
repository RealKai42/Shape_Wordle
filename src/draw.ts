import { renderableKeyword, renderableFillingWord, Options } from "./interface"
import { createCanvas } from "canvas"

export function draw(
  keywords: renderableKeyword[],
  fillingWords: renderableFillingWord[],
  options: Options
) {
  const { width, height, resizeFactor } = options

  const canvas = createCanvas(width * resizeFactor, height * resizeFactor)
  const ctx = canvas.getContext("2d")

  keywords.forEach(
    ({ name, color, x, y, drawX, drawY, angle, fontFamily, fontWeight, fontSize }) => {
      ctx.save()
      ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`
      ctx.fillStyle = color
      ctx.translate(x * resizeFactor, y * resizeFactor)
      ctx.rotate(angle)
      ctx.textAlign = "start"
      ctx.textBaseline = "alphabetic"
      ctx.fillText(name, drawX * resizeFactor, drawY * resizeFactor)
      ctx.restore()
    }
  )

  fillingWords.forEach(({ name, x, y, angle, color, alpha, fontSize, fontWeight, fontFamily }) => {
    const preAlpha = ctx.globalAlpha
    ctx.save()

    ctx.globalAlpha = alpha
    ctx.font = `${fontWeight} ${fontSize * resizeFactor}px ${fontFamily}`
    ctx.fillStyle = color
    ctx.translate(x * resizeFactor, y * resizeFactor)
    ctx.rotate(angle)
    ctx.textAlign = "start"
    ctx.textBaseline = "alphabetic"
    ctx.fillText(name, 0, 0)

    ctx.globalAlpha = preAlpha
    ctx.restore()
  })

  return canvas.toBuffer()
}
