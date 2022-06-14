import { Canvas, createCanvas, CanvasRenderingContext2D } from 'canvas';
import { MessageAttachment } from 'discord.js';
import Magnify from './Magnify';

export interface Options {
  leftURL: string;
  rightURL: string;
  margin?: number; // in pixels between the images (default: 10)
  reduceOnMagnify?: boolean;
  ignoreMaxSize?: boolean;
}

export default class Stick {
  private leftURL: string;
  private rightURL: string;
  private leftCanvas: Canvas;
  private rightCanvas: Canvas;
  private margin: number;
  private reduceOnMagnify: boolean;
  private ignoreMaxSize: boolean;
  private canvas: Canvas;
  private context: CanvasRenderingContext2D;

  constructor(options: Options) {
    this.leftURL = options.leftURL;
    this.rightURL = options.rightURL;
    this.margin = options.margin || 16; // in pixels
    this.reduceOnMagnify = options.reduceOnMagnify ?? true;
  }

  private async init() {
    this.leftCanvas = (await new Magnify({ textureURL: this.leftURL, factor: 256, allowSmaller: this.reduceOnMagnify }).getAsCanvas(false)) as Canvas;
    this.rightCanvas = (await new Magnify({ textureURL: this.rightURL, factor: 128, allowSmaller: this.reduceOnMagnify }).getAsCanvas(false)) as Canvas;

    this.canvas = createCanvas(
      this.leftCanvas.width + this.rightCanvas.width + this.margin,
      Math.max(this.leftCanvas.height, this.rightCanvas.height),
    );
    this.context = this.canvas.getContext('2d');
    this.context.imageSmoothingEnabled = false;
  }

  private stick(): Canvas {
    this.context.drawImage(this.leftCanvas, 0, 0);
    this.context.drawImage(this.rightCanvas, this.leftCanvas.width + this.margin, 0);

    return this.canvas;
  }

  public async getAsCanvas(): Promise<Canvas> {
    return this.init().then(() => this.stick());
  }

  public async getAsBuffer(): Promise<Buffer> {
    return this.getAsCanvas().then((canvas) => canvas.toBuffer('image/png'));
  }

  public async getAsAttachment(attachmentName?: string): Promise<MessageAttachment> {
    return this.getAsBuffer().then((buffer) => new MessageAttachment(buffer, attachmentName ?? 'sticked.png'));
  }
}
