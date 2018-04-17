import Validations from './Validations.js'

export const COLOR_PROFILES = {
  RGBA: {
    numberOfChannels: 4
  }
}

const isEven = n => n % 2 === 0
const EMPTY_PIXEL = {
  red: 0,
  green: 0,
  blue: 0,
  alpha: 0
}

const vonNeumannOffsets = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 }
]

class PixelMatrix {
  static fromCanvas (canvas) {
    const context = canvas.getContext('2d')
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return new PixelMatrix(
      imageData.data,
      canvas.width,
      canvas.height,
      COLOR_PROFILES.RGBA,
      false
    )
  }
  static empty (width, height) {
    return new PixelMatrix(null, width, height)
  }
  get numberOfChannels () {
    return this.colorProfile.numberOfChannels
  }
  get dimensions () {
    return [this.width, this.height]
  }
  constructor (
    pixels,
    width,
    height,
    colorProfile = COLOR_PROFILES.RGBA,
    useExtendedValidations = true
  ) {
    if (pixels == null) {
      pixels = new Uint8ClampedArray(
        width * height * colorProfile.numberOfChannels
      )
    }
    if (width == null) {
      throw new Error(`Expected width to be defined, but was ${width}.`)
    }
    if (height == null) {
      throw new Error(`Expected height to be defined, but was ${height}.`)
    }
    this.width = width
    this.height = height
    this.colorProfile = colorProfile
    this.pixels = pixels
    this.validations = new Validations(useExtendedValidations)
  }
  get (point) {
    this.validations.shouldBePoint(point)
    if (!this.contains(point)) {
      return null
    }
    const i = this.getIndex(point)
    const red = this.pixels[i]
    const green = this.pixels[i + 1]
    const blue = this.pixels[i + 2]
    const alpha = this.pixels[i + 3]
    return { red, green, blue, alpha }
  }
  getRandomPoint () {
    const x = Math.round(Math.random() * (this.width - 1))
    const y = Math.round(Math.random() * (this.height - 1))
    return { x, y }
  }
  getVonNeumannNeighbors (point) {
    this.validations.shouldBePoint(point)
    const neighbors = []
    vonNeumannOffsets.forEach(offset => {
      const neighbor = {
        x: point.x + offset.x,
        y: point.y + offset.y
      }
      if (this.contains(neighbor)) {
        neighbors.push(neighbor)
      }
    })
    return neighbors
  }
  getMooreNeighbors (point) {
    this.validations.shouldBePoint(point)
    const neighbors = []
    for (var x = -1; x <= 1; x++) {
      for (var y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
          continue
        }

        const neighbor = {
          x: point.x + x,
          y: point.y + y
        }
        if (this.contains(neighbor)) {
          neighbors.push(neighbor)
        }
      }
    }
    return neighbors
  }
  set (point, pixel) {
    this.validations.shouldBePoint(point)
    this.validations.shouldBePixel(pixel)
    const { red, green, blue, alpha } = pixel
    const i = this.getIndex(point)
    this.pixels[i] = red
    this.pixels[i + 1] = green
    this.pixels[i + 2] = blue
    this.pixels[i + 3] = alpha
  }
  randomDitherFrom (newMatrix, samples = 1000) {
    for (var _ = 0; _ < samples; _++) {
      const point = this.getRandomPoint()
      const newPixel = newMatrix.get(point)
      let p = newPixel
      const darkeningFactor = 0
      if (Math.random() > 0.5) {
        p = {
          red: newPixel.red - darkeningFactor,
          green: newPixel.green - darkeningFactor,
          blue: newPixel.blue - darkeningFactor,
          alpha: 255
        }
      }
      this.getVonNeumannNeighbors(point).forEach(neighbor => {
        this.set(neighbor, p)
      })
    }
  }
  getIndex (point) {
    const { x, y } = point
    const xTooBig = x >= this.width
    const yTooBig = y >= this.height
    if (xTooBig || yTooBig) {
      throw new Error(
        `Expected x and y to be less than or equal to (${this.width}, ${
          this.height
        }) but was actually (${x}, ${y})`
      )
    }
    return y * (this.width * this.numberOfChannels) + x * this.numberOfChannels
  }
  forEach (fn) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const point = Object.freeze({ x, y })
        const pixel = this.get(point)
        fn(point, pixel, this)
      }
    }
  }
  map (fn) {
    const newPixelMatrix = new PixelMatrix(
      null,
      this.width,
      this.height,
      this.colorProfile
    )
    this.forEach((point, pixel, pixelMatrix) => {
      const newPixel = fn(point, pixel, pixelMatrix)
      if (!newPixel) {
        throw new Error(
          `Expected mapper function to return a pixel, but got ${JSON.stringify(
            newPixel
          )}. Did you forget a return statement in your mapper function?`
        )
      }
      newPixelMatrix.set(point, newPixel)
    })
    return newPixelMatrix
  }
  normalizedMap (fn) {
    return this.map((point, pixel, pixelMatrix) => {
      const normalizedPoint = {
        x: point.x / this.width,
        y: point.y / this.height
      }
      return fn(normalizedPoint, normalizedPoint, pixelMatrix)
    })
  }
  reduce (fn, startingValue) {
    if (startingValue == null) {
      throw new Error(
        `Expected startingValue to be defined, but instead it was ${startingValue}.`
      )
    }
    let total = startingValue
    this.forEach((point, pixel) => {
      total = fn(total, point, pixel)
    })
    return total
  }
  getWindow (center, width, height) {
    if (isEven(width)) {
      throw new Error(`Expected an odd window width, but got ${width}`)
    }
    if (isEven(height)) {
      throw new Error(`Expected an odd window height, but got ${height}`)
    }
    const xRadius = (width - 1) / 2
    const yRadius = (height - 1) / 2
    const windowMatrix = new PixelMatrix(
      null,
      width,
      height,
      this.colorProfile
    )
    for (let yOffset = -yRadius; yOffset <= yRadius; yOffset++) {
      for (let xOffset = -xRadius; xOffset <= xRadius; xOffset++) {
        let x = center.x + xOffset
        let y = center.y + yOffset
        const pixel = this.get({ x, y }) || EMPTY_PIXEL
        const point = { x: xOffset + xRadius, y: yOffset + yRadius }
        windowMatrix.set(point, pixel)
      }
    }
    return windowMatrix
  }
  contains (point) {
    return (
      point.x >= 0 &&
      point.x < this.width &&
      point.y >= 0 &&
      point.y < this.height
    )
  }
  toImageData () {
    return new window.ImageData(this.pixels, this.width, this.height)
  }
  putPixels (canvas) {
    if (canvas.width !== this.width || canvas.height !== this.height) {
      throw new Error(
        `Expected canvas dimensions and PixelMatrix dimensions to be the same, but canvas dimensions were [${
          canvas.width
        }, ${canvas.height}] and PixelMatrix dimensions were ${
          this.dimensions
        }.`
      )
    }
    const context = canvas.getContext('2d')
    context.putImageData(this.toImageData(), 0, 0)
  }
  getCenter () {
    const x = Math.floor(this.width / 2)
    const y = Math.floor(this.height / 2)
    return { x, y }
  }
}

export default PixelMatrix
