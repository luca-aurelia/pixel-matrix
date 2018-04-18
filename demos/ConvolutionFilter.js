const assertEqual = (a, b) => {
  if (a !== b) {
    throw new Error(`Expected ${a} and ${b} to be the same, but they weren't.`)
  }
}

class ConvolutionFilter {
  get mapper () {
    return (point, pixel, matrix) => {
      const windowMatrix = matrix.getWindow(point, this.width, this.height)
      return this.apply(windowMatrix)
    }
  }
  constructor (weights) {
    this.weights = weights
    this.height = weights.length
    this.width = weights[0].length
  }
  apply (pixelMatrix) {
    assertEqual(pixelMatrix.height, this.height)
    assertEqual(pixelMatrix.width, this.width)
    const reducer = (sum, point, pixel) => {
      const weight = this.getWeight(point)
      // eslint-ignore
      return {
        red: sum.red + pixel.red * weight,
        green: sum.green + pixel.green * weight,
        blue: sum.blue + pixel.blue * weight,
        alpha: 255
      }
    }
    const result = pixelMatrix.reduce(reducer, { red: 0, green: 0, blue: 0 })
    return result
  }
  getWeight (point) {
    return this.weights[point.y][point.x]
  }
}

export default ConvolutionFilter
