# Pixel Matrix
> An eloquent ES6 nano-module for working with pixel data.

# Live Demo

https://pixel-matrix-demo.glitch.me/
<br>
<br>
![Pixel Matrix gradient demo](https://user-images.githubusercontent.com/5033974/38850626-37c1b496-41e0-11e8-8451-06cfcaa29323.png)

# Install

`$ npm install pixel-matrix`

# Usage
> ⚠️ PixelMatrix is an ES module, so make sure you're using it with a transpiler or an environment that supports them.

## Convert an image to greyscale

```js
import PixelMatrix from 'pixel-matrix'

// Read pixels from a canvas element
const canvas = document.querySelector('canvas')
canvas.style.imageRendering = 'pixelated'
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
import PixelMatrix from './index.js'

// Create canvas
const canvas = document.createElement('canvas')
canvas.width = 16
canvas.height = 16
canvas.style.imageRendering = 'pixelated'
canvas.style.width = '500px'
canvas.style.height = '500px'
canvas.style.margin = 'auto'
document.body.appendChild(canvas)

// Initialize an empty 16 x 16 pixel matrix
const emptyPixelMatrix = PixelMatrix.fromCanvas(canvas)

// normalizedMap normalizes point.x and point.y to [0, 1] before passing them to
// the callback.
const gradient = emptyPixelMatrix.normalizedMap(point => {
  return {
    red: point.x * 255,
    green: 0,
    blue: point.y * 255,
    alpha: 255
  }
})

// Write pixels to canvas
gradient.putPixels(canvas)
```
