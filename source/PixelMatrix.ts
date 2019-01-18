// RGB and HSL conversion utilities from
// https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
const to255 = (x: number) => Math.min(Math.floor(x * 256), 255)
const hue2rgb = (p: number, q: number, t: number) => {
  if (t < 0) t += 1
  if (t > 1) t -= 1
  if (t < 1 / 6) return p + (q - p) * 6 * t
  if (t < 1 / 2) return q
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
  return p
}

// RGBA is [0, 255]
// HSLA is [0, 1]
export const toRgba = (pixel: HslaPixel): RgbaPixel => {
  let r: number
  let g: number
  let b: number
  const { hue: h, saturation: s, lightness: l, alpha: a } = pixel

  if (s === 0) {
    r = g = b = l
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  const red = to255(r)
  const green = to255(g)
  const blue = to255(b)
  const alpha = to255(a)
  return { red, green, blue, alpha }
}

export const toHsla = (pixel: RgbaPixel): HslaPixel => {
  let { red: r, green: g, blue: b, alpha: a } = pixel
  r /= 255
  g /= 255
  b /= 255
  a /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const middle = (max + min) / 2
  let h: number = middle
  let s: number = middle
  let l: number = middle

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return { hue: h, saturation: s, lightness: s, alpha: a }
}

interface ColorProfile {
  channels: number
}

const RGBA: ColorProfile = {
  channels: 4
}

export const COLOR_PROFILES = {
  RGBA
}

export type Shape = [number, number]

export interface RgbaPixel {
  red: number
  green: number
  blue: number
  alpha: number
}

export interface HslaPixel {
  hue: number
  saturation: number
  lightness: number
  alpha: number
}

export interface Point {
  x: number
  y: number
}

export interface PixelForEacher {
  (pixel: RgbaPixel, point: Point, pixelMatrix: PixelMatrix): void
}

export interface PixelMapper {
  (pixel: RgbaPixel, point: Point, pixelMatrix: PixelMatrix): RgbaPixel
}

export interface PixelReducer<T> {
  (total: T, pixel: RgbaPixel, point: Point): T
}

const isEven = (n: number) => n % 2 === 0

const EMPTY_PIXEL: RgbaPixel = {
  red: 0,
  green: 0,
  blue: 0,
  alpha: 255
}

export const vonNeumannOffsets: Point[] = [
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 }
]

export const mooreOffsets: Point[] = []

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    if (x === 0 && y === 0) {
      continue
    }
    mooreOffsets.push({ x, y })
  }
}

export default class PixelMatrix {
  static fromCanvas(canvas: HTMLCanvasElement) {
    const context: CanvasRenderingContext2D = canvas.getContext('2d')!
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    return new PixelMatrix(canvas.width, canvas.height, imageData.data)
  }
  pixels: Uint8ClampedArray
  private _pixelMatrix: RgbaPixel[][] | undefined
  get pixelMatrix() {
    if (!this._pixelMatrix) {
      const pixelMatrix = new Array(this.width)
      this.forEach((pixel, point) => {
        if (!pixelMatrix[point.x]) pixelMatrix[point.x] = []
        pixelMatrix[point.x][point.y] = pixel
      })
      this._pixelMatrix = pixelMatrix
    }

    return this._pixelMatrix
  }
  get channels() {
    return this.colorProfile.channels
  }
  get colorProfile() {
    return RGBA
  }
  get shape(): Shape {
    return [this.width, this.height]
  }
  get countPixels(): number {
    return this.width * this.height
  }
  constructor(
    public width: number,
    public height: number,
    pixels?: Uint8ClampedArray
  ) {
    const pixelsLength = width * height * this.colorProfile.channels
    if (pixels === undefined) {
      pixels = new Uint8ClampedArray(pixelsLength)
    } else {
      if (pixelsLength !== pixels.length) {
        throw new Error(
          `Expected pixels to have length ${pixelsLength} (width * height * colorProfile.channels) but got ${
            pixels.length
          } instead.`
        )
      }
    }
    this.pixels = pixels
  }
  get(point: Point): RgbaPixel {
    if (!this.contains(point)) {
      throw new Error(`This pixel matrix doesn't contain the point ${point}.`)
    }
    const i = this.getIndex(point)

    let channels: number[] = []
    for (
      let channelOffset = 0;
      channelOffset < this.colorProfile.channels;
      channelOffset++
    ) {
      const channel = this.pixels[i + channelOffset]
      if (!channel) return EMPTY_PIXEL
      channels.push(channel)
    }

    const [red, green, blue, alpha] = channels
    return { red, green, blue, alpha }
  }
  getRandomPoint(): Point {
    const x = Math.floor(Math.random() * this.width)
    const y = Math.floor(Math.random() * this.height)
    return { x, y }
  }
  getRandomPixel(): RgbaPixel {
    const randomPoint = this.getRandomPoint()
    return this.get(randomPoint)
  }
  getVonNeumannNeighboringPixels(point: Point): RgbaPixel[] {
    return this.getNeighboringPixels(point, vonNeumannOffsets)
  }
  getVonNeumannNeighboringPoints(point: Point): Point[] {
    return this.getNeighbors(point, vonNeumannOffsets)
  }
  getMooreNeighboringPixels(point: Point): RgbaPixel[] {
    return this.getNeighboringPixels(point, mooreOffsets)
  }
  getMooreNeighboringPoints(point: Point): Point[] {
    return this.getNeighbors(point, mooreOffsets)
  }
  getNeighboringPixels(point: Point, neighborhood: Point[]): RgbaPixel[] {
    return this.getNeighbors(point, neighborhood).map(neighbor =>
      this.get(neighbor)
    )
  }
  getNeighbors(point: Point, neighborhood: Point[]): Point[] {
    const neighbors: Point[] = []
    neighborhood.forEach(offset => {
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
  setHsla(point: Point, pixel: HslaPixel): void {
    this.set(point, toRgba(pixel))
  }
  set(point: Point, pixel: RgbaPixel): void {
    const { red, green, blue, alpha } = pixel
    const i = this.getIndex(point)
    this.pixels[i] = red
    this.pixels[i + 1] = green
    this.pixels[i + 2] = blue
    this.pixels[i + 3] = alpha
    this.pixelMatrix[point.x][point.y] = pixel
  }
  randomDitherFrom(newMatrix: PixelMatrix, samples = 1000) {
    for (let _ = 0; _ < samples; _++) {
      const point = this.getRandomPoint()
      const newPixel = newMatrix.get(point)
      let p = newPixel
      const darkeningFactor = 0
      if (Math.random() > 0.5) {
        p = {
          red: p.red - darkeningFactor,
          green: p.green - darkeningFactor,
          blue: p.blue - darkeningFactor,
          alpha: 255
        }
      }
      this.getVonNeumannNeighboringPoints(point).forEach(neighbor => {
        this.set(neighbor, p)
      })
    }
  }
  protected getIndex(point: Point): number {
    const { x, y } = point
    if (!this.contains(point)) {
      throw new Error(
        `Expected x and y to be less than or equal to (${this.width}, ${
          this.height
        }) but was actually (${x}, ${y})`
      )
    }
    return y * (this.width * this.channels) + x * this.channels
  }
  forEach(fn: PixelForEacher) {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const point = Object.freeze({ x, y })
        const pixel = this.get(point)
        fn(pixel, point, this)
      }
    }
  }
  map(fn: PixelMapper) {
    const newPixelMatrix = new PixelMatrix(this.width, this.height)
    this.forEach((pixel, point, pixelMatrix) => {
      const newPixel = fn(pixel, point, pixelMatrix)
      newPixelMatrix.set(point, newPixel)
    })
    return newPixelMatrix
  }
  normalizedMap(fn: PixelMapper) {
    return this.map((pixel, point, pixelMatrix) => {
      const normalizedPoint = {
        x: point.x / this.width,
        y: point.y / this.height
      }
      return fn(pixel, normalizedPoint, pixelMatrix)
    })
  }
  reduce<T>(fn: PixelReducer<T>, startingValue: T) {
    let total = startingValue
    this.forEach((pixel, point) => {
      total = fn(total, pixel, point)
    })
    return total
  }
  getWindow(center: Point, width: number, height: number): PixelMatrix {
    if (isEven(width)) {
      throw new Error(`Expected an odd window width, but got ${width}`)
    }
    if (isEven(height)) {
      throw new Error(`Expected an odd window height, but got ${height}`)
    }
    const xRadius = (width - 1) / 2
    const yRadius = (height - 1) / 2
    const windowMatrix = new PixelMatrix(width, height)
    for (let yOffset = -yRadius; yOffset <= yRadius; yOffset++) {
      for (let xOffset = -xRadius; xOffset <= xRadius; xOffset++) {
        let x = center.x + xOffset
        let y = center.y + yOffset
        const point = { x, y }
        const pixel = this.contains(point) ? this.get(point) : EMPTY_PIXEL
        const pointInWindow = { x: xOffset + xRadius, y: yOffset + yRadius }
        windowMatrix.set(pointInWindow, pixel)
      }
    }
    return windowMatrix
  }
  contains(point: Point): boolean {
    return (
      point.x >= 0 &&
      point.x < this.width &&
      point.y >= 0 &&
      point.y < this.height
    )
  }
  toImageData() {
    return new ImageData(this.pixels, this.width, this.height)
  }
  putPixels(canvas: HTMLCanvasElement) {
    if (canvas.width !== this.width || canvas.height !== this.height) {
      throw new Error(
        `Expected canvas shape and PixelMatrix shape to be the same, but canvas shape was [${
          canvas.width
        }, ${canvas.height}] and PixelMatrix shape was ${this.shape}.`
      )
    }
    const context = canvas.getContext('2d')!
    context.putImageData(this.toImageData(), 0, 0)
  }
  getCenter(): Point {
    const x = Math.floor(this.width / 2)
    const y = Math.floor(this.height / 2)
    return { x, y }
  }
}
