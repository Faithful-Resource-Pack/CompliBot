import { ImageData, createCanvas, loadImage } from "@napi-rs/canvas";

export interface HEX {
	value: string;
}

export interface HEXA extends HEX {}

export interface RGBA extends RGB {
	a: number;
}

export interface RGB {
	r: number;
	g: number;
	b: number;
}

export interface HSL {
	h: number;
	s: number;
	l: number;
}

export interface HSV {
	h: number;
	s: number;
	v: number;
}

export interface CMYK {
	c: number;
	m: number;
	y: number;
	k: number;
}

interface ColorManagerOptions {
	hex?: string;
	rgb?: { r: number; g: number; b: number; a?: number };
	hsl?: { h: number; s: number; l: number };
	hsv?: { h: number; s: number; v: number };
	cmyk?: { c: number; m: number; y: number; k: number };
}

/**
 * Convert and handle colors
 * @author Nick
 */
export default class ColorManager {
	private color: RGBA;

	private decimalToHex(c: number | string): string {
		const hex = typeof c === "string" ? parseInt(c, 10).toString(16) : c.toString(16);
		return hex.length == 1 ? `0${hex}` : hex;
	}

	async swapPixel(options: { url: string; color: RGBA; target: RGBA }) {
		const canvas = createCanvas(512, 512);
		const ctx = canvas.getContext("2d");
		ctx.imageSmoothingEnabled = false;

		const imgToDraw = await loadImage(options.url);

		ctx.drawImage(imgToDraw, 0, 0, canvas.width, canvas.height);

		const img: ImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		for (let i = 0; i < img.data.length; i += 4) {
			// only met when its the same color as the target color
			if (
				img.data[i] == options.target.r &&
				img.data[i + 1] == options.target.g &&
				img.data[i + 2] == options.target.b &&
				img.data[i + 3] == options.target.a * 255
			) {
				img.data[i] = options.color.r;
				img.data[i + 1] = options.color.g;
				img.data[i + 2] = options.color.b;
				img.data[i + 3] = options.color.a * 255;
			}
		}

		ctx.putImageData(img, 0, 0);
		return canvas.toBuffer("image/png");
	}

	toHEX(): HEX {
		return { value: this.toHEXA().value.slice(0, 6) };
	}

	toHEXA(): HEXA {
		return {
			value:
				this.decimalToHex(this.color.r) +
				this.decimalToHex(this.color.g) +
				this.decimalToHex(this.color.b) +
				this.decimalToHex(+(this.color.a * 255).toFixed(0)),
		};
	}

	toHSL(): HSL {
		// gets as float between 0 and 1
		const r = this.color.r / 255;
		const g = this.color.g / 255;
		const b = this.color.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const diff = max - min;

		let h: number;
		let s: number;

		// average brightness across all three channels
		const l = (max + min) / 2;

		// all color channels are equal so it's grayscale
		if (!diff) return { h: 0, s: 0, l };
		s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

		// calculates hue based off the brightest channel
		switch (max) {
			case r:
				h = (g - b) / diff + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / diff + 2;
				break;
			case b:
				h = (r - g) / diff + 4;
				break;
		}

		// converts hue to match the other channels
		h /= 6;

		return { h, s, l };
	}

	toHSV(): HSV {
		const r = this.color.r / 255;
		const g = this.color.g / 255;
		const b = this.color.b / 255;

		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const diff = max - min;

		let h: number;
		if (!diff) h = 0;
		else
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
			}

		const s = max === 0 ? 0 : diff / max;
		const v = max;

		return { h: +h.toFixed(0), s: +(s * 100).toFixed(1), v: +(v * 100).toFixed(1) };
	}

	toRGB(): RGB {
		const d = this.toRGBA();
		delete d.a;
		return d;
	}

	toRGBA(): RGBA {
		return this.color;
	}

	toCMYK(): CMYK {
		let c = 1 - this.color.r / 255;
		let m = 1 - this.color.g / 255;
		let y = 1 - this.color.b / 255;
		let k = Math.min(c, m, y);

		c = Math.round(((c - k) / (1 - k)) * 10000) / 100;
		m = Math.round(((m - k) / (1 - k)) * 10000) / 100;
		y = Math.round(((y - k) / (1 - k)) * 10000) / 100;
		k = Math.round(k * 10000) / 100;

		c ||= 0;
		m ||= 0;
		y ||= 0;
		k ||= 0;

		return {
			c: Math.round(c),
			m: Math.round(m),
			y: Math.round(y),
			k: Math.round(k),
		};
	}

	constructor(options?: ColorManagerOptions) {
		// from rgb(a) to rgba
		if (options.rgb) {
			this.color = {
				r: options.rgb.r > 255 ? 255 : options.rgb.r < 0 ? 0 : options.rgb.r,
				g: options.rgb.g > 255 ? 255 : options.rgb.g < 0 ? 0 : options.rgb.g,
				b: options.rgb.b > 255 ? 255 : options.rgb.b < 0 ? 0 : options.rgb.b,
				a: options.rgb.a ? (options.rgb.a > 1 ? 1 : options.rgb.a < 0 ? 0 : options.rgb.a) : 1,
			};
		}

		// from cmyk to rgba
		if (options.cmyk) {
			options.cmyk.c = +(
				(options.cmyk.c > 100 ? 100 : options.cmyk.c < 0 ? 0 : options.cmyk.c) / 100
			).toFixed(2);
			options.cmyk.m = +(
				(options.cmyk.m > 100 ? 100 : options.cmyk.m < 0 ? 0 : options.cmyk.m) / 100
			).toFixed(2);
			options.cmyk.y = +(
				(options.cmyk.y > 100 ? 100 : options.cmyk.y < 0 ? 0 : options.cmyk.y) / 100
			).toFixed(2);
			options.cmyk.k = +(
				(options.cmyk.k > 100 ? 100 : options.cmyk.k < 0 ? 0 : options.cmyk.k) / 100
			).toFixed(2);

			this.color = {
				r: +(255 * (1 - options.cmyk.c) * (1 - options.cmyk.k)).toFixed(0),
				g: +(255 * (1 - options.cmyk.m) * (1 - options.cmyk.k)).toFixed(0),
				b: +(255 * (1 - options.cmyk.y) * (1 - options.cmyk.k)).toFixed(0),
				a: 1,
			};
		}

		// from hex to rgba
		if (options.hex) {
			const regHex = /^#?[A-Fa-f\d]{3,8}?$/i;
			if (regHex.test(options.hex)) {
				if (options.hex.startsWith("#")) options.hex = options.hex.slice(-options.hex.length + 1);

				switch (options.hex.length) {
					case 3:
						options.hex =
							options.hex[0] +
							options.hex[0] +
							options.hex[1] +
							options.hex[1] +
							options.hex[2] +
							options.hex[2] +
							"ff";
						break;
					case 4:
						options.hex =
							options.hex[0] +
							options.hex[0] +
							options.hex[1] +
							options.hex[1] +
							options.hex[2] +
							options.hex[2] +
							options.hex[3] +
							options.hex[3];
						break;
					case 5:
						options.hex = "000000ff";
						break;
					case 6:
						options.hex =
							options.hex[0] +
							options.hex[1] +
							options.hex[2] +
							options.hex[3] +
							options.hex[4] +
							options.hex[5] +
							"ff";
						break;
					case 7:
						options.hex = "000000ff";
						break;
					case 8:
						break;
				}
			} else options.hex = "000000ff";

			const arr = options.hex.match(/.{2}/g); // split into groups of two
			this.color = {
				r: parseInt(arr[0], 16),
				g: parseInt(arr[1], 16),
				b: parseInt(arr[2], 16),
				a: +(parseInt(arr[3], 16) / 255).toFixed(2),
			};
		}

		const hslv = (h: number, c: number, x: number, m: number): void => {
			let r = 0;
			let g = 0;
			let b = 0;

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
			};
		};

		// from hsv to rgba
		if (options.hsv) {
			options.hsv.h = +(options.hsv.h % 360).toFixed(2);
			options.hsv.s = +(
				(options.hsv.s > 100 ? 100 : options.hsv.s < 0 ? 0 : options.hsv.s) / 100
			).toFixed(2);
			options.hsv.v = +(
				(options.hsv.v > 100 ? 100 : options.hsv.v < 0 ? 0 : options.hsv.v) / 100
			).toFixed(2);

			const h = options.hsv.h / 60;
			const c = options.hsv.v * options.hsv.s;
			const x = c * (1 - Math.abs((h % 2) - 1));
			const m = options.hsv.v - c;

			hslv(h, c, x, m);
		}

		// from hsl to rgba
		if (options.hsl) {
			options.hsl.h = +(options.hsl.h % 360).toFixed(2);
			options.hsl.s = +(
				(options.hsl.s > 100 ? 100 : options.hsl.s < 0 ? 0 : options.hsl.s) / 100
			).toFixed(2);
			options.hsl.l = +(
				(options.hsl.l > 100 ? 100 : options.hsl.l < 0 ? 0 : options.hsl.l) / 100
			).toFixed(2);

			const h = options.hsl.h / 60;
			const c = (1 - Math.abs(2 * options.hsl.l - 1)) * options.hsl.s;
			const x = c * (1 - Math.abs((h % 2) - 1));
			const m = options.hsl.l - c / 2;

			hslv(h, c, x, m);
		}
	}
}
