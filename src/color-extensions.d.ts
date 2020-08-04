declare module "color-extensions"

declare class ColorInterpolator {
  constructor(colormap: object)
  getColor(value: number, type: string)
}
