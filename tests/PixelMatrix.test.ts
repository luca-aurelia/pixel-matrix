import PixelMatrix from '../source/PixelMatrix'

let pixelMatrix: PixelMatrix
beforeEach(() => {
  pixelMatrix = new PixelMatrix(10, 10)
})
test('.set updates the pixel at the given point', () => {
  const point = { x: 1, y: 3 }
  const pixel = { red: 6, green: 2, blue: 5, alpha: 1 }
  pixelMatrix.set(point, pixel)
  expect(pixelMatrix.get(point)).toEqual(pixel)
})
