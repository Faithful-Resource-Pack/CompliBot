import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';

interface HEXA extends HEX { }
interface HEX {
  value: string;
}
interface RGBA extends RGB { a: number }
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface ColorManagerOptions {
  hex?: string;
  rgb?: Array<number>
}

export class ColorManager {
  private color: HEXA | RGBA;

  private b10b16(c: number | string): string {
    let hex = (typeof c === 'string') ? parseInt(c, 10).toString(16) : c.toString(16);
    return hex.length == 1 ? `0${hex}` : hex;
  }

  async swapPixel(options: { url: string, color: RGBA, target: RGBA }): Promise<Buffer> {
    let canvas = createCanvas(256, 256);
    let ctx = canvas.getContext('2d');

    let imgToDraw = await loadImage(options.url).catch((err) => {
      console.trace(err);
      return Promise.reject(err);
    });

    ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);
    // ctx.fillStyle = '#fff';
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    let img = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < img.data.length; i += 4) {
      // only met when its the same color as the target color
      if (
        img.data[i] == options.target.r &&
        img.data[i + 1] == options.target.g &&
        img.data[i + 2] == options.target.b
      ) {
        img.data[i] = options.color.r;
        img.data[i + 1] = options.color.g;
        img.data[i + 2] = options.color.b;
        img.data[i + 3] = options.color.a * 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return canvas.toBuffer('image/png');
  }

  toHEX(): HEX {
    return { value: this.toHEXA().value.slice(0, 6) } as HEX;
  }

  toHEXA(): HEXA {
    if ('value' in this.color) return this.color as HEXA;

    if ('r' in this.color && 'g' in this.color && 'b' in this.color) {
      return { value: `${this.b10b16(this.color.r)}${this.b10b16(this.color.g)}${this.b10b16(this.color.b)}` } as HEXA;
    }
  }

  toRGB(): RGB {
    let d: RGBA = this.toRGBA();
    delete d.a;
    return d as RGB;
  }

  toRGBA(): RGBA {
    if ('r' in this.color && 'g' in this.color && 'b' in this.color && 'a' in this.color) return this.color;
    if ('value' in this.color) {
      let res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(this.color.value)

      return res ? {
        r: parseInt(res[1], 16),
        g: parseInt(res[2], 16),
        b: parseInt(res[3], 16),
        a: +(parseInt(res[4], 16) / 255).toFixed(2)
      } : { r: 0, g: 0, b: 0, a: 0 }
    }
  }

  constructor(options?: ColorManagerOptions) {
    if (options.rgb) {
      this.color = {
        r: options.rgb[0] ? (options.rgb[0] > 255 ? 255 : (options.rgb[0] < 0 ? 0 : options.rgb[0])) : 0,
        g: options.rgb[1] ? (options.rgb[1] > 255 ? 255 : (options.rgb[1] < 0 ? 0 : options.rgb[1])) : 0,
        b: options.rgb[2] ? (options.rgb[2] > 255 ? 255 : (options.rgb[2] < 0 ? 0 : options.rgb[2])) : 0,
        a: options.rgb[3] ? (options.rgb[3] > 1 ? 1 : (options.rgb[3] < 0 ? 0 : options.rgb[3])) : 1,
      } as RGBA;
    }

    if (options.hex) {
      switch (options.hex.length) {
        case 3:
          let [r, g, b] = options.hex.split('');
          this.color = { value: (r + r + g + g + b + b + 'ff').toLowerCase() } as HEXA;
          break;
        case 4:
          let [r1, g1, b1, a] = options.hex.split('');
          this.color = { value: (r1 + r1 + g1 + g1 + b1 + b1 + a + a).toLowerCase() } as HEXA;
          break;
        case 6:
          this.color = { value: `${options.hex}ff`.toLowerCase() } as HEXA;
          break;
        case 8:
          this.color = { value: options.hex.toLowerCase() } as HEXA;
          break;
        default:
          this.color = { value: "00000000" } as HEXA;
          break;
      }
    }
  }
}