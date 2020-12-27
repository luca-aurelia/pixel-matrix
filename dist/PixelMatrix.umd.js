(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.PixelMatrix = mod.exports;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  const channelOffsets = {
    red: 0,
    green: 1,
    blue: 2,
    alpha: 3
  };
  const channels = Object.keys(channelOffsets);

  class PixelMatrix {
    static async fromImageSource(source) {
      return new Promise((resolve, reject) => {
        const image = new window.Image();
        image.src = source;

        image.onload = function () {
          const pixelMatrix = PixelMatrix.fromImage(image);
          resolve(pixelMatrix);
        };
      });
    }

    static fromImage(image) {
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      return PixelMatrix.fromCanvas(canvas);
    }

    static fromCanvas(canvas) {
      const context = canvas.getContext('2d');
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      return new PixelMatrix(canvas.width, canvas.height, imageData);
    }

    constructor(width, height, imageData) {
      const pixelsLength = width * height * this.channelCount;

      if (imageData === undefined) {
        const pixels = new Uint8ClampedArray(pixelsLength);
        imageData = new ImageData(pixels, width, height);
      }

      const pixels = imageData.data;

      if (pixelsLength !== pixels.length) {
        throw new Error(`Expected pixels to have length ${pixelsLength} (width * height * 4) but got ${pixels.length} instead. (We multiply by 4 because we have 4 channels: red, green, blue, and alpha.)`);
      }

      this.imageData = imageData;
      this.pixels = pixels;
      this.width = width;
      this.height = height;
    }

    get channelCount() {
      return channels.length;
    }

    get(x, y) {
      return [this.getColor(x, y, 'red'), this.getColor(x, y, 'green'), this.getColor(x, y, 'blue'), this.getColor(x, y, 'alpha')];
    }

    getColor(x, y, channelName) {
      if (!this.contains(x, y)) {
        throw new Error(`This pixel matrix doesn't contain the point (${x}, ${y}).`);
      }

      const i = this.getIndex(x, y);
      const channelOffset = channelOffsets[channelName];
      return this.pixels[i + channelOffset];
    }

    set(x, y, red, green, blue, alpha) {
      const i = this.getIndex(x, y);
      this.pixels[i] = red;
      this.pixels[i + 1] = green;
      this.pixels[i + 2] = blue;
      this.pixels[i + 3] = alpha;
    }

    getIndex(x, y) {
      if (!this.contains(x, y)) {
        throw new Error(`Expected x and y to be less than or equal to (${this.width}, ${this.height}) but they were actually (${x}, ${y}).`);
      }

      return y * (this.width * this.channelCount) + x * this.channelCount;
    }

    contains(x, y) {
      return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    drawToContext(context) {
      if (context.canvas.width !== this.width || context.canvas.height !== this.height) {
        throw new Error(`Expected canvas shape and PixelMatrix shape to be the same, but canvas shape was [${context.canvas.width}, ${context.canvas.height}] and PixelMatrix shape was [${this.width}, ${this.height}].`);
      }

      context.putImageData(this.imageData, 0, 0);
    }

  }

  _exports.default = PixelMatrix;
});
