var to255 = function (x) { return Math.min(Math.floor(x * 256), 255); };
var hue2rgb = function (p, q, t) {
    if (t < 0)
        t += 1;
    if (t > 1)
        t -= 1;
    if (t < 1 / 6)
        return p + (q - p) * 6 * t;
    if (t < 1 / 2)
        return q;
    if (t < 2 / 3)
        return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};
export var toRgba = function (pixel) {
    var r;
    var g;
    var b;
    var h = pixel.hue, s = pixel.saturation, l = pixel.lightness, a = pixel.alpha;
    if (s === 0) {
        r = g = b = l;
    }
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    var red = to255(r);
    var green = to255(g);
    var blue = to255(b);
    var alpha = to255(a);
    return { red: red, green: green, blue: blue, alpha: alpha };
};
export var toHsla = function (pixel) {
    var r = pixel.red, g = pixel.green, b = pixel.blue, a = pixel.alpha;
    r /= 255;
    g /= 255;
    b /= 255;
    a /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var middle = (max + min) / 2;
    var h = middle;
    var s = middle;
    var l = middle;
    if (max === min) {
        h = s = 0;
    }
    else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }
    return { hue: h, saturation: s, lightness: s, alpha: a };
};
var RGBA = {
    channels: 4
};
export var COLOR_PROFILES = {
    RGBA: RGBA
};
var isEven = function (n) { return n % 2 === 0; };
var EMPTY_PIXEL = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 255
};
export var vonNeumannOffsets = [
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: 0, y: -1 },
    { x: 0, y: 1 }
];
export var mooreOffsets = [];
for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
        if (x === 0 && y === 0) {
            continue;
        }
        mooreOffsets.push({ x: x, y: y });
    }
}
var PixelMatrix = (function () {
    function PixelMatrix(width, height, pixels) {
        this.width = width;
        this.height = height;
        var pixelsLength = width * height * this.colorProfile.channels;
        if (pixels === undefined) {
            pixels = new Uint8ClampedArray(pixelsLength);
        }
        else {
            if (pixelsLength !== pixels.length) {
                throw new Error("Expected pixels to have length " + pixelsLength + " (width * height * colorProfile.channels) but got " + pixels.length + " instead.");
            }
        }
        this.pixels = pixels;
    }
    PixelMatrix.fromCanvas = function (canvas) {
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        return new PixelMatrix(canvas.width, canvas.height, imageData.data);
    };
    Object.defineProperty(PixelMatrix.prototype, "pixelMatrix", {
        get: function () {
            if (!this._pixelMatrix) {
                var pixelMatrix_1 = new Array(this.width);
                this.forEach(function (pixel, point) {
                    if (!pixelMatrix_1[point.x])
                        pixelMatrix_1[point.x] = [];
                    pixelMatrix_1[point.x][point.y] = pixel;
                });
                this._pixelMatrix = pixelMatrix_1;
            }
            return this._pixelMatrix;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PixelMatrix.prototype, "channels", {
        get: function () {
            return this.colorProfile.channels;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PixelMatrix.prototype, "colorProfile", {
        get: function () {
            return RGBA;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PixelMatrix.prototype, "shape", {
        get: function () {
            return [this.width, this.height];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PixelMatrix.prototype, "countPixels", {
        get: function () {
            return this.width * this.height;
        },
        enumerable: true,
        configurable: true
    });
    PixelMatrix.prototype.get = function (point) {
        if (!this.contains(point)) {
            throw new Error("This pixel matrix doesn't contain the point " + point + ".");
        }
        var i = this.getIndex(point);
        var channels = [];
        for (var channelOffset = 0; channelOffset < this.colorProfile.channels; channelOffset++) {
            var channel = this.pixels[i + channelOffset];
            if (!channel)
                return EMPTY_PIXEL;
            channels.push(channel);
        }
        var red = channels[0], green = channels[1], blue = channels[2], alpha = channels[3];
        return { red: red, green: green, blue: blue, alpha: alpha };
    };
    PixelMatrix.prototype.getRandomPoint = function () {
        var x = Math.floor(Math.random() * this.width);
        var y = Math.floor(Math.random() * this.height);
        return { x: x, y: y };
    };
    PixelMatrix.prototype.getRandomPixel = function () {
        var randomPoint = this.getRandomPoint();
        return this.get(randomPoint);
    };
    PixelMatrix.prototype.getVonNeumannNeighboringPixels = function (point) {
        return this.getNeighboringPixels(point, vonNeumannOffsets);
    };
    PixelMatrix.prototype.getVonNeumannNeighboringPoints = function (point) {
        return this.getNeighbors(point, vonNeumannOffsets);
    };
    PixelMatrix.prototype.getMooreNeighboringPixels = function (point) {
        return this.getNeighboringPixels(point, mooreOffsets);
    };
    PixelMatrix.prototype.getMooreNeighboringPoints = function (point) {
        return this.getNeighbors(point, mooreOffsets);
    };
    PixelMatrix.prototype.getNeighboringPixels = function (point, neighborhood) {
        var _this = this;
        return this.getNeighbors(point, neighborhood).map(function (neighbor) {
            return _this.get(neighbor);
        });
    };
    PixelMatrix.prototype.getNeighbors = function (point, neighborhood) {
        var _this = this;
        var neighbors = [];
        neighborhood.forEach(function (offset) {
            var neighbor = {
                x: point.x + offset.x,
                y: point.y + offset.y
            };
            if (_this.contains(neighbor)) {
                neighbors.push(neighbor);
            }
        });
        return neighbors;
    };
    PixelMatrix.prototype.setHsla = function (point, pixel) {
        this.set(point, toRgba(pixel));
    };
    PixelMatrix.prototype.set = function (point, pixel) {
        var red = pixel.red, green = pixel.green, blue = pixel.blue, alpha = pixel.alpha;
        var i = this.getIndex(point);
        this.pixels[i] = red;
        this.pixels[i + 1] = green;
        this.pixels[i + 2] = blue;
        this.pixels[i + 3] = alpha;
        this.pixelMatrix[point.x][point.y] = pixel;
    };
    PixelMatrix.prototype.randomDitherFrom = function (newMatrix, samples) {
        var _this = this;
        if (samples === void 0) { samples = 1000; }
        var _loop_1 = function (_) {
            var point = this_1.getRandomPoint();
            var newPixel = newMatrix.get(point);
            var p = newPixel;
            var darkeningFactor = 0;
            if (Math.random() > 0.5) {
                p = {
                    red: p.red - darkeningFactor,
                    green: p.green - darkeningFactor,
                    blue: p.blue - darkeningFactor,
                    alpha: 255
                };
            }
            this_1.getVonNeumannNeighboringPoints(point).forEach(function (neighbor) {
                _this.set(neighbor, p);
            });
        };
        var this_1 = this;
        for (var _ = 0; _ < samples; _++) {
            _loop_1(_);
        }
    };
    PixelMatrix.prototype.getIndex = function (point) {
        var x = point.x, y = point.y;
        if (!this.contains(point)) {
            throw new Error("Expected x and y to be less than or equal to (" + this.width + ", " + this.height + ") but was actually (" + x + ", " + y + ")");
        }
        return y * (this.width * this.channels) + x * this.channels;
    };
    PixelMatrix.prototype.forEach = function (fn) {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                var point = Object.freeze({ x: x, y: y });
                var pixel = this.get(point);
                fn(pixel, point, this);
            }
        }
    };
    PixelMatrix.prototype.map = function (fn) {
        var newPixelMatrix = new PixelMatrix(this.width, this.height);
        this.forEach(function (pixel, point, pixelMatrix) {
            var newPixel = fn(pixel, point, pixelMatrix);
            newPixelMatrix.set(point, newPixel);
        });
        return newPixelMatrix;
    };
    PixelMatrix.prototype.normalizedMap = function (fn) {
        var _this = this;
        return this.map(function (pixel, point, pixelMatrix) {
            var normalizedPoint = {
                x: point.x / _this.width,
                y: point.y / _this.height
            };
            return fn(pixel, normalizedPoint, pixelMatrix);
        });
    };
    PixelMatrix.prototype.reduce = function (fn, startingValue) {
        var total = startingValue;
        this.forEach(function (pixel, point) {
            total = fn(total, pixel, point);
        });
        return total;
    };
    PixelMatrix.prototype.getWindow = function (center, width, height) {
        if (isEven(width)) {
            throw new Error("Expected an odd window width, but got " + width);
        }
        if (isEven(height)) {
            throw new Error("Expected an odd window height, but got " + height);
        }
        var xRadius = (width - 1) / 2;
        var yRadius = (height - 1) / 2;
        var windowMatrix = new PixelMatrix(width, height);
        for (var yOffset = -yRadius; yOffset <= yRadius; yOffset++) {
            for (var xOffset = -xRadius; xOffset <= xRadius; xOffset++) {
                var x = center.x + xOffset;
                var y = center.y + yOffset;
                var point = { x: x, y: y };
                var pixel = this.contains(point) ? this.get(point) : EMPTY_PIXEL;
                var pointInWindow = { x: xOffset + xRadius, y: yOffset + yRadius };
                windowMatrix.set(pointInWindow, pixel);
            }
        }
        return windowMatrix;
    };
    PixelMatrix.prototype.contains = function (point) {
        return (point.x >= 0 &&
            point.x < this.width &&
            point.y >= 0 &&
            point.y < this.height);
    };
    PixelMatrix.prototype.toImageData = function () {
        return new ImageData(this.pixels, this.width, this.height);
    };
    PixelMatrix.prototype.putPixels = function (canvas) {
        if (canvas.width !== this.width || canvas.height !== this.height) {
            throw new Error("Expected canvas shape and PixelMatrix shape to be the same, but canvas shape was [" + canvas.width + ", " + canvas.height + "] and PixelMatrix shape was " + this.shape + ".");
        }
        var context = canvas.getContext('2d');
        context.putImageData(this.toImageData(), 0, 0);
    };
    PixelMatrix.prototype.getCenter = function () {
        var x = Math.floor(this.width / 2);
        var y = Math.floor(this.height / 2);
        return { x: x, y: y };
    };
    return PixelMatrix;
}());
export default PixelMatrix;
