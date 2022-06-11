import {
  CanvasRenderingContext2D,
  Canvas, createCanvas, Image, loadImage,
} from 'canvas';
import { MessageAttachment } from 'discord.js';
import getFactor, { canBeMagnified, MAX_SURFACE } from 'helpers/functions/canvas/getFactor';

export interface Options {
  textureURL: string;
  factor?: number
  orientation?: 'portrait' | 'landscape' | 'none';
}

export default class Magnify {
  private textureURL: string;
  private factor: number;
  private orientation: Options['orientation'] = 'none';
  private texture: Image;
  private canvas: Canvas;
  private width: number;
  private height: number;
  private context: CanvasRenderingContext2D;

  constructor(options: Options) {
    this.textureURL = options.textureURL;
    this.factor = options.factor || null;
    this.orientation = options.orientation || 'none';
  }

  private async init() {
    this.texture = await loadImage(this.textureURL);

    // if no factor is provided, calculate the factor based on the image size
    if (!this.factor) this.factor = getFactor(this.texture.width, this.texture.height);
    // if a factor is provided detect if is a valid factor (not too big)
    else if (this.factor * this.texture.width * this.factor * this.texture.height > MAX_SURFACE) {
      do {
        this.factor /= 2;
      } while (this.factor * this.texture.width * this.factor * this.texture.height > MAX_SURFACE);
    }

    [this.width, this.height] = [this.texture.width * this.factor, this.texture.height * this.factor];
  }

  private magnify(): Canvas {
    this.canvas = createCanvas(
      this.orientation === 'none' || this.orientation === 'portrait'
        ? Math.round(this.width)
        : Math.round(this.width * (16 / 9)),
      this.orientation === 'none' || this.orientation === 'landscape'
        ? Math.round(this.height)
        : Math.round(this.height * (16 / 9)),
    );

    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(
      this.texture,
      this.orientation === 'none' || this.orientation === 'portrait' ? 0 : Math.round((this.width * (16 / 9)) / 4),
      this.orientation === 'none' || this.orientation === 'landscape' ? 0 : Math.round((this.height * (16 / 9)) / 4),
      Math.round(this.width),
      Math.round(this.height),
    );

    return this.canvas;
  }

  private verify() {
    if (!this.texture) throw new Error('No texture provided');
    if (!canBeMagnified(this.width, this.height)) throw new Error('Image is too big to be magnified');
  }

  public async getAsCanvas(doVerify: boolean = true): Promise<Canvas | string> {
    return this.init()
      .then(() => (doVerify ? this.verify() : null))
      .then(() => this.magnify())
      .catch((err: Error) => err.message);
  }

  public async getAsBuffer(doVerify: boolean = true): Promise<Buffer | string> {
    return this.init()
      .then(() => (doVerify ? this.verify() : null))
      .then(() => this.magnify().toBuffer())
      .catch((err: Error) => err.message);
  }

  public async getAsAttachment(attachmentName?: string, doVerify: boolean = true): Promise<MessageAttachment | string> {
    return this.init()
      .then(() => (doVerify ? this.verify() : null))
      .then(() => new MessageAttachment(this.magnify().toBuffer(), attachmentName ?? 'magnified.png'))
      .catch((err: Error) => err.message);
  }
}
