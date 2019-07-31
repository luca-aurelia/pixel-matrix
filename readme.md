# Pixel Matrix
> A [tiny (< 2 KB)](https://bundlephobia.com/result?p=@noise-machines/pixel-matrix) library for playing with pixels.

# Live Demo


# Install

`yarn add @noise-machines/pixel-matrix`

# Usage

## Create a random image

```js
import PixelMatrix from '@noise-machines/pixel-matrix'

const canvas = document.querySelector('canvas')

// Returns a random number between 0 and 256.
const getRandomColorChannel = () => Math.floor(Math.random() * 256)

// Colors in Pixel Matrix are just JSON objects.
const getRandomColor = () => {
  return {
    red:  getRandomColorChannel(),
    green: getRandomColorChannel(),
    blue: getRandomColorChannel(),
    alpha: 255
  }
}

// Create a pixel matrix that's the same width and height as the canvas,
// then populate it with random colors.
const pixelMatrix = new PixelMatrix(canvas.width, canvas.height).map(getRandomColor)

// Draw to the canvas.
pixelMatrix.putPixels(canvas)
```