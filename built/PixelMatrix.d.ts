export declare const toRgba: (pixel: HslaPixel) => RgbaPixel;
export declare const toHsla: (pixel: RgbaPixel) => HslaPixel;
interface ColorProfile {
    channels: number;
}
export declare const COLOR_PROFILES: {
    RGBA: ColorProfile;
};
export declare type Shape = [number, number];
export interface RgbaPixel {
    red: number;
    green: number;
    blue: number;
    alpha: number;
}
export interface HslaPixel {
    hue: number;
    saturation: number;
    lightness: number;
    alpha: number;
}
export interface Point {
    x: number;
    y: number;
}
export interface PixelForEacher {
    (pixel: RgbaPixel, point: Point, pixelMatrix: PixelMatrix): void;
}
export interface PixelMapper {
    (pixel: RgbaPixel, point: Point, pixelMatrix: PixelMatrix): RgbaPixel;
}
export interface PixelReducer<T> {
    (total: T, pixel: RgbaPixel, point: Point): T;
}
export declare const vonNeumannOffsets: Point[];
export declare const mooreOffsets: Point[];
export default class PixelMatrix {
    width: number;
    height: number;
    static fromCanvas(canvas: HTMLCanvasElement): PixelMatrix;
    pixels: Uint8ClampedArray;
    private _pixelMatrix;
    readonly pixelMatrix: RgbaPixel[][];
    readonly channels: number;
    readonly colorProfile: ColorProfile;
    readonly shape: Shape;
    readonly countPixels: number;
    constructor(width: number, height: number, pixels?: Uint8ClampedArray);
    get(point: Point): RgbaPixel;
    getRandomPoint(): Point;
    getRandomPixel(): RgbaPixel;
    getVonNeumannNeighboringPixels(point: Point): RgbaPixel[];
    getVonNeumannNeighboringPoints(point: Point): Point[];
    getMooreNeighboringPixels(point: Point): RgbaPixel[];
    getMooreNeighboringPoints(point: Point): Point[];
    getNeighboringPixels(point: Point, neighborhood: Point[]): RgbaPixel[];
    getNeighbors(point: Point, neighborhood: Point[]): Point[];
    setHsla(point: Point, pixel: HslaPixel): void;
    set(point: Point, pixel: RgbaPixel): void;
    randomDitherFrom(newMatrix: PixelMatrix, samples?: number): void;
    protected getIndex(point: Point): number;
    forEach(fn: PixelForEacher): void;
    map(fn: PixelMapper): PixelMatrix;
    normalizedMap(fn: PixelMapper): PixelMatrix;
    reduce<T>(fn: PixelReducer<T>, startingValue: T): T;
    getWindow(center: Point, width: number, height: number): PixelMatrix;
    contains(point: Point): boolean;
    toImageData(): ImageData;
    putPixels(canvas: HTMLCanvasElement): void;
    getCenter(): Point;
}
export {};
