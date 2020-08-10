import { twoDimenArray, calDistance } from "./helper"
const eps = 0.0000001
/**
 * 根据螺旋线迭代取得一个位置
 * @param dist
 * @param startPoint
 * @param pos
 * @param canvasWidth
 * @param canvasHeight
 */
export function iterate(
  dist: twoDimenArray,
  startPoint: number[],
  pos: number[],
  canvasWidth: number,
  canvasHeight: number
) {
  // m 可以控制螺旋线在法向上的前进速度
  // dEta 可以控制螺旋线在当前距离场方向的切线方向的前进速度
  const m = 0.7,
    dEta = Math.PI / 10
  const point = { x: pos[0], y: pos[1] }
  // 距中心的半径 r
  const r = calDistance(pos, startPoint)
  // 法线
  let normal = computeSDF(dist, point.x, point.y)
  normal = [-normal[0], -normal[1]]
  const normalLen = norm(normal)
  // 切线
  const tangent = [-normal[1], normal[0]]
  // 黑塞矩阵是为了计算距离场中某点的曲率
  const hessian = computeHessian(dist, point.x, point.y)
  let tem = [
    tangent[0] * hessian.xx + tangent[1] * hessian.xy,
    tangent[0] * hessian.xy + tangent[1] * hessian.yy,
  ]
  const temValue = tangent[0] * tem[0] + tangent[1] * tem[1]
  const curvature = Math.max(temValue / (normalLen * normalLen * normalLen), 0.001)
  // 曲率半径 R
  const R = Math.abs(1 / curvature)

  let dTheta = (R * dEta) / r
  dTheta = dTheta / Math.PI / 100
  // tangent 方向的位移
  const maxTS = 1.2,
    minTS = 1
  let dTangent = [r * dTheta * (tangent[0] / normalLen), r * dTheta * (tangent[1] / normalLen)]
  let normDT = norm(dTangent)
  // 调整tangent方向的位移
  if (normDT > maxTS) {
    dTangent = [(maxTS / normDT) * dTangent[0], (maxTS / normDT) * dTangent[1]]
  }
  if (norm(dTangent) < minTS) {
    dTangent = [(tangent[0] * 2) / normalLen, (tangent[1] * 2) / normalLen]
  }

  // normal 方向位移
  const dNormal = [m * dTheta * (normal[0] / normalLen), m * dTheta * (normal[1] / normalLen)]

  const dx = dNormal[0] + dTangent[0]
  const dy = dNormal[1] + dTangent[1]
  point.x += dx
  point.y += dy

  // 检测是否出界
  if (point.x && point.y) {
    if (dist.get(Math.floor(point.x), Math.floor(point.y)) <= 0) {
      return false
    }
    if (point.x > canvasWidth - 2 || point.x < 2) {
      return false
    }
    if (point.y > canvasHeight - 2 || point.y < 2) {
      return false
    }
  } else {
    return false
  }
  return [point.x, point.y]
}

function computeSDF(dist: twoDimenArray, px: number, py: number) {
  // 计算signed distance field相关信息，得到当前点的梯度方向
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) }
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)
  const localGrad = { x: 0, y: 0 }
  const gradX = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ]
  const gradY = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ]

  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset,
        offsetY = j - offset
      const local = -dist.get(wordPosition.x + offsetX, wordPosition.y + offsetY)
      localGrad.x += local * gradX[i][j]
      localGrad.y += local * gradY[i][j]
    }
  }

  return [localGrad.x, localGrad.y]
}

function computeHessian(dist: twoDimenArray, px: number, py: number) {
  // Hessian 矩阵, 用于描述函数局部的曲率
  const wordPosition = { x: Math.floor(px), y: Math.floor(py) }
  const kernelSize = 3
  const offset = Math.floor(kernelSize / 2)
  const gradX = [
    [1, 2, 1],
    [0, 0, 0],
    [-1, -2, -1],
  ]
  const gradY = [
    [1, 0, -1],
    [2, 0, -2],
    [1, 0, -1],
  ]
  const localHessian = { xx: 0, xy: 0, yy: 0 }

  for (let i = 0; i < kernelSize; i++) {
    for (let j = 0; j < kernelSize; j++) {
      const offsetX = i - offset,
        offsetY = j - offset
      const localGrad = computeSDF(dist, wordPosition.x + offsetX, wordPosition.y + offsetY)
      localHessian.xx += localGrad[0] * gradX[i][j]
      localHessian.xy += localGrad[0] * gradY[i][j]
      localHessian.yy += localGrad[1] * gradY[i][j]
    }
  }

  return localHessian
}

function norm(vec: number[]) {
  return Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1])
}
