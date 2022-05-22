import { Canvas, createCanvas, loadImage } from 'canvas';

interface HEXA extends HEX {}
interface HEX {
  value: string;
}
interface RGBA extends RGB {
  a: number;
}
interface RGB {
  r: number;
  g: number;
  b: number;
}
interface HSL {
  h: number;
  s: number;
  l: number;
}
interface HSV {
  h: number;
  s: number;
  v: number;
}
interface CMYK {
  c: number;
  m: number;
  y: number;
  k: number;
}
interface ColorManagerOptions {
  hex?: string;
  rgb?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  hsl?: {
    h: number;
    s: number;
    l: number;
  };
  hsv?: {
    h: number;
    s: number;
    v: number;
  };
  cmyk?: {
    c: number;
    m: number;
    y: number;
    k: number;
  };
}

function b10b16(c: number | string): string {
  const hex = typeof c === 'string' ? parseInt(c, 10).toString(16) : c.toString(16);
  return hex.length === 1 ? `0${hex}` : hex;
}

export default class ColorManager {
  private color: RGBA;

  private canvas: Canvas;

  async swapPixel(options: { url: string; color: RGBA; target: RGBA }): Promise<Buffer> {
    this.canvas = createCanvas(512, 512);
    const ctx = this.canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const imgToDraw = await loadImage(options.url).catch((err) => {
      console.trace(err);
      return Promise.reject(err);
    });

    ctx.drawImage(imgToDraw, 0, 0, this.canvas.width, this.canvas.height);

    const img = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < img.data.length; i += 4) {
      // only met when its the same color as the target color
      if (
        img.data[i] === options.target.r
        && img.data[i + 1] === options.target.g
        && img.data[i + 2] === options.target.b
        && img.data[i + 3] === options.target.a * 255
      ) {
        img.data[i] = options.color.r;
        img.data[i + 1] = options.color.g;
        img.data[i + 2] = options.color.b;
        img.data[i + 3] = options.color.a * 255;
      }
    }

    ctx.putImageData(img, 0, 0);
    return this.canvas.toBuffer('image/png');
  }

  toHEX(): HEX {
    return {
      value: this.toHEXA().value.slice(0, 6),
    } as HEX;
  }

  toHEXA(): HEXA {
    return {
      value: `${b10b16(this.color.r)}${b10b16(this.color.g)}${b10b16(this.color.b)}${b10b16(
        +(this.color.a * 255).toFixed(0),
      )}`,
    } as HEXA;
  }

  toHSL(): HSL {
    const r: number = this.color.r / 255;
    const g: number = this.color.g / 255;
    const b: number = this.color.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h: number;
    let s: number;
    let l: number = (max + min) / 2;

    if (diff === 0) h = 0;
    else if (max === r) h = ((g - b) / diff) % 6;
    else if (max === g) h = (b - r) / diff + 2;
    else h = (r - g) / diff + 4;
    h *= 60;
    if (h < 0) h += 360;

    l = (max + min) / 2;

    if (diff === 0) s = 0;
    else s = diff / (1 - Math.abs(2 * l - 1));

    return {
      h: +h.toFixed(0),
      s: +(s * 100).toFixed(1),
      l: +(l * 100).toFixed(1),
    } as HSL;
  }

  toHSV(): HSV {
    const r: number = this.color.r / 255;
    const g: number = this.color.g / 255;
    const b: number = this.color.b / 255;

    const max: number = Math.max(r, g, b);
    const min: number = Math.min(r, g, b);
    const diff: number = max - min;

    let h: number;
    if (diff === 0) h = 0;
    else {
      switch (max) {
        case r:
          h = 60 * (((g - b) / diff) % 6);
          break;
        case g:
          h = 60 * ((b - r) / diff + 2);
          break;
        case b:
          h = 60 * ((r - g) / diff + 4);
          break;
        default:
          break;
      }
    }

    const s: number = max === 0 ? 0 : diff / max;
    const v: number = max;

    return {
      h: +h.toFixed(0),
      s: +(s * 100).toFixed(1),
      v: +(v * 100).toFixed(1),
    } as HSV;
  }

  toRGB(): RGB {
    const d: RGBA = this.toRGBA();
    delete d.a;
    return d as RGB;
  }

  toRGBA(): RGBA {
    return this.color;
  }

  toCMYK(): CMYK {
    let c: number = 1 - this.color.r / 255;
    let m: number = 1 - this.color.g / 255;
    let y: number = 1 - this.color.b / 255;
    let k: number = Math.min(c, m, y);

    c = Math.round(((c - k) / (1 - k)) * 10000) / 100;
    m = Math.round(((m - k) / (1 - k)) * 10000) / 100;
    y = Math.round(((y - k) / (1 - k)) * 10000) / 100;
    k = Math.round(k * 10000) / 100;

    c = Number.isNaN(c) ? 0 : c;
    m = Number.isNaN(m) ? 0 : m;
    y = Number.isNaN(y) ? 0 : y;
    k = Number.isNaN(k) ? 0 : k;

    return {
      c: Math.round(c),
      m: Math.round(m),
      y: Math.round(y),
      k: Math.round(k),
    } as CMYK;
  }

  constructor(options?: ColorManagerOptions) {
    // from rgb(a) to rgba
    if (options.rgb) {
      this.color = {
        r: options.rgb.r % 256 ?? 0,
        g: options.rgb.g % 256 ?? 0,
        b: options.rgb.b % 256 ?? 0,
        a: options.rgb.a % 1.01 ?? 1,
      } as RGBA;
    }

    // from cmyk to rgba
    if (options.cmyk) {
      options.cmyk.c = +((options.cmyk.c % 101 ?? 0) / 100).toFixed(2);
      options.cmyk.m = +((options.cmyk.m % 101 ?? 0) / 100).toFixed(2);
      options.cmyk.y = +((options.cmyk.y % 101 ?? 0) / 100).toFixed(2);
      options.cmyk.k = +((options.cmyk.k % 101 ?? 0) / 100).toFixed(2);

      this.color = {
        r: +(255 * (1 - options.cmyk.c) * (1 - options.cmyk.k)).toFixed(0),
        g: +(255 * (1 - options.cmyk.m) * (1 - options.cmyk.k)).toFixed(0),
        b: +(255 * (1 - options.cmyk.y) * (1 - options.cmyk.k)).toFixed(0),
        a: 1,
      } as RGBA;
    }

    // from hex to rgba
    if (options.hex) {
      const regHex = /^#?[A-Fa-f\d]{3,8}?$/i;
      if (regHex.test(options.hex)) {
        if (options.hex.startsWith('#')) options.hex = options.hex.slice(-options.hex.length + 1);

        switch (options.hex.length) {
          case 3:
            options.hex = `${options.hex[0]
              + options.hex[0]
              + options.hex[1]
              + options.hex[1]
              + options.hex[2]
              + options.hex[2]
            }ff`;
            break;
          case 4:
            options.hex = options.hex[0]
              + options.hex[0]
              + options.hex[1]
              + options.hex[1]
              + options.hex[2]
              + options.hex[2]
              + options.hex[3]
              + options.hex[3];
            break;
          case 5:
            options.hex = '000000ff';
            break;
          case 6:
            options.hex = `${options.hex[0]
              + options.hex[1]
              + options.hex[2]
              + options.hex[3]
              + options.hex[4]
              + options.hex[5]
            }ff`;
            break;
          case 7:
            options.hex = '000000ff';
            break;
          default:
            break;
        }
      } else options.hex = '000000ff';

      const arr = options.hex.match(/.{2}/g); // cut it each 2 chars;
      this.color = {
        r: parseInt(arr[0], 16),
        g: parseInt(arr[1], 16),
        b: parseInt(arr[2], 16),
        a: +(parseInt(arr[3], 16) / 255).toFixed(2),
      } as RGBA;
    }

    const hslv = (h: number, c: number, x: number, m: number): void => {
      let r: number = 0;
      let g: number = 0;
      let b: number = 0;
      if (h >= 0 && h < 1) {
        r = c;
        g = x;
      } else if (h >= 1 && h < 2) {
        r = x;
        g = c;
      } else if (h >= 2 && h < 3) {
        g = c;
        b = x;
      } else if (h >= 3 && h < 4) {
        g = x;
        b = c;
      } else if (h >= 4 && h < 5) {
        r = x;
        b = c;
      } else {
        r = c;
        b = x;
      }

      r += m;
      g += m;
      b += m;
      r *= 255.0;
      g *= 255.0;
      b *= 255.0;
      r = Math.round(r);
      g = Math.round(g);
      b = Math.round(b);

      this.color = {
        r,
        g,
        b,
        a: 1,
      } as RGBA;
    };

    // from hsv to rgba
    if (options.hsv) {
      options.hsv.h = +(options.hsv.h % 360).toFixed(2);
      options.hsv.s = +((options.hsv.s % 101 ?? 0) / 100).toFixed(2);
      options.hsv.v = +((options.hsv.v % 101 ?? 0) / 100).toFixed(2);

      const h: number = options.hsv.h / 60;
      const c: number = options.hsv.v * options.hsv.s;
      const x: number = c * (1 - Math.abs((h % 2) - 1));
      const m: number = options.hsv.v - c;

      hslv(h, c, x, m);
    }

    // from hsl to rgba
    if (options.hsl) {
      options.hsl.h = +(options.hsl.h % 360).toFixed(2);
      options.hsl.s = +((options.hsl.s % 101 ?? 0) / 100).toFixed(2);
      options.hsl.l = +((options.hsl.l % 101 ?? 0) / 100).toFixed(2);

      const h: number = options.hsl.h / 60;
      const c: number = (1 - Math.abs(2 * options.hsl.l - 1)) * options.hsl.s;
      const x: number = c * (1 - Math.abs((h % 2) - 1));
      const m: number = options.hsl.l - c / 2;

      hslv(h, c, x, m);
    }
  }
}
