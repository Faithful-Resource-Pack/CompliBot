import GIFEncoder from '@class/MCAnimation/GIFEncoder';
import { MCMETA } from '@helpers/interfaces/firestorm';
import {
  Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage,
} from 'canvas';
import { MessageAttachment } from 'discord.js';
import getFactor from 'helpers/functions/canvas/getFactor';

export interface Options {
  url: string;
  mcmeta?: MCMETA;
  magnify?: boolean; // if true, the image will be magnified
  sticked?: boolean; // if true, the GIF will be adapted to the size of the sticked textures
  stickedMargin?: number;
}

export default class MCAnimation {
  private textureURL: string;
  private texture: Image;
  private mcmeta: MCMETA;
  private canvas: Canvas;
  private context: CanvasRenderingContext2D;
  private frames: Array<{ index: number; duration: number }> = [];
  private currentFrame: number = 0;
  private ticks: number = 0;
  private interval: number;
  private encoder: GIFEncoder;
  private magnify: boolean = false;
  private factor: number = 1;
  private sticked: boolean = false;
  private stickedMargin: number = 0;
  private width: number;
  private height: number;

  constructor(options: Options) {
    this.textureURL = options.url;
    this.mcmeta = options.mcmeta ?? { animation: {} };
    this.magnify = options.magnify ?? false;
    this.sticked = options.sticked ?? false;
    this.stickedMargin = options.stickedMargin ?? 0;
  }

  private async init() {
    this.texture = await loadImage(this.textureURL);

    if (this.magnify) this.factor = getFactor(this.texture.width, this.texture.width);

    this.width = this.texture.width * this.factor;
    this.height = (this.sticked ? (this.texture.width - this.stickedMargin) / 2 : this.texture.width) * this.factor;

    this.canvas = createCanvas(this.width, this.height);
    this.context = this.canvas.getContext('2d');

    const t = Math.max(this.mcmeta.animation.frametime || 1, 1);

    if (this.mcmeta.animation.frames && this.mcmeta.animation.frames.length > 0) {
      this.interval = this.mcmeta.animation.interpolate
        || this.mcmeta.animation.frames.find((e) => typeof e === 'object' && e.time % t !== 0)
        ? 1
        : t;

      for (let e = 0; e < this.mcmeta.animation.frames.length; e += 1) {
        const a = this.mcmeta.animation.frames[e];

        if (typeof a === 'object') this.frames.push({ index: a.index, duration: Math.max(a.time, 1) / this.interval });
        else this.frames.push({ index: a, duration: t / this.interval });
      }
    } else {
      this.interval = this.mcmeta.animation.interpolate ? 1 : t;
      const e = this.sticked ? this.texture.height / this.height : this.texture.height / this.texture.width;
      for (let a = 0; a < e; a += 1) this.frames.push({ index: a, duration: t / this.interval });
    }
  }

  private draw(frameIndex = 0, ticks = 0): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.imageSmoothingEnabled = this.texture.width > this.canvas.width;
    this.context.globalAlpha = 1;

    this.context.drawImage(
      this.texture, // image to draw
      0, // source X
      //* when sticked, the image is already magnified, so we need to use it's dimensions as is
      (this.sticked ? this.height : this.texture.width) * this.frames[frameIndex].index, // source Y
      this.sticked ? this.width : this.texture.width, // source width
      this.sticked ? this.height : this.texture.width, // source height
      0, // destination X
      0, // destination Y
      this.canvas.width, // destination width
      this.canvas.height, // destination height
    );

    if (this.mcmeta.animation.interpolate) {
      this.context.globalAlpha = ticks / this.frames[frameIndex].duration;
      this.context.drawImage(
        this.texture,
        0,
        (this.sticked ? this.height : this.texture.width) * this.frames[(frameIndex + 1) % this.frames.length].index,
        this.sticked ? this.width : this.texture.width,
        this.sticked ? this.height : this.texture.width,
        0,
        0,
        this.canvas.width,
        this.canvas.height,
      );
    }
  }

  private update() {
    this.ticks += 1;
    if (this.frames[this.currentFrame].duration <= this.ticks) {
      this.ticks = 0;
      this.currentFrame += 1;

      if (this.currentFrame >= this.frames.length) return;

      this.draw(this.currentFrame, this.ticks);
      this.encoder.addFrame(this.context);
      this.encoder.setDelay(this.interval * 50);
    } else if (this.mcmeta.animation.interpolate) {
      this.draw(this.currentFrame, this.ticks);
      this.encoder.addFrame(this.context);
    }
  }

  public async createGIF(): Promise<Buffer> {
    await this.init();

    this.encoder = new GIFEncoder(this.width, this.height);
    this.encoder.start();
    this.encoder.setTransparent(true);

    if (this.frames.length > 1) {
      while (this.currentFrame < this.frames.length) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise<void>((resolve) => setTimeout(() => resolve(), this.interval * 50));
        this.update();
      }
    } else {
      this.draw();
      this.encoder.addFrame(this.context);
    }

    this.encoder.finish();
    return this.encoder.out.getData();
  }

  public async getAsAttachment(attachmentName?: string): Promise<MessageAttachment> {
    return this.createGIF().then((buffer) => new MessageAttachment(buffer, attachmentName ?? 'animation.gif'));
  }
}
