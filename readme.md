# Pixel Matrix
> An eloquent ES6 nano-module for working with pixel data.

# Install

`$ npm install pixel-matrix`

# Usage
> ⚠️ PixelMatrix is an ES module, so make sure you're using it with a transpiler or an environment that supports them. ⚠️

## Convert an image to greyscale

```js
import PixelMatrix from 'pixel-matrix'

// Read pixels from a canvas element
const canvas = document.querySelector('canvas')
const pixelMatrix = PixelMatrix.fromCanvas(canvas)

// Convert to greyscale
const greyscale = pixel => {
  const average = (pixel.red + pixel.green + pixel.blue) / 3
  return {
    red: average,
    blue: average,
    green: average,
    alpha: pixel.alpha
  }
}
const greyscalePixelMatrix = pixels.map(greyscale)

// Write pixels to canvas
greyscalePixelMatrix.putPixels(canvas)
```

## Create a gradient

```js
import PixelMatrix, { COLOR_PROFILES } from 'pixel-matrix'

// Initialize an empty 16 x 16 pixel matrix
const width = 16
const height = 16
const emptyPixelMatrix = PixelMatrix.empty(width, height)

// normalizedMap normalizes point.x and point.y to [0, 1] before passing them to
// the callback.
const gradient = emptyPixelMatrix.normalizedMap(point => ({
  red: point.x * 255,
  green: 0,
  blue: point.y * 255,
  alpha: 255
}))

// Write pixels to canvas
const canvas = document.querySelector('canvas')
gradient.putPixels(canvas)
```
