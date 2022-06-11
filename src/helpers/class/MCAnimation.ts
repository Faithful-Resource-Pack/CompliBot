import GIFEncoder from '@helpers/functions/canvas/GIFEncoder';
import { MCMETA } from '@helpers/interfaces/firestorm';
import {
  Canvas, CanvasRenderingContext2D, createCanvas, Image, loadImage,
} from 'canvas';

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

  constructor(texture: string, mcmeta: MCMETA, magnified: boolean = false) {
    this.textureURL = texture;
    this.mcmeta = mcmeta;
    this.magnify = magnified;
    if (!this.mcmeta.animation) this.mcmeta.animation = {};
  }

  private async load() {
    this.texture = await loadImage(this.textureURL);

    if (this.magnify) {
      const surface = this.texture.width * this.texture.width;

      if (surface <= 256) this.factor = 32; // 16²px or below
      if (surface > 256) this.factor = 16; // 16²px
      if (surface > 1024) this.factor = 8; // 32²px
      if (surface > 4096) this.factor = 4; // 64²px
      if (surface > 65636) this.factor = 2;

      // 262144 = 512²px
      if (surface >= 262144) this.factor = 1;
    }

    this.canvas = createCanvas(this.texture.width * this.factor, this.texture.width * this.factor);
    this.context = this.canvas.getContext('2d');

    const t = Math.max(this.mcmeta.animation.frametime || 1, 1);

    if (this.mcmeta.animation.frames && this.mcmeta.animation.frames.length > 0) {
      this.interval = this.mcmeta.animation.interpolate || this.mcmeta.animation.frames.find((e) => typeof e === 'object' && e.time % t !== 0)
        ? 1
        : t;

      for (let e = 0; e < this.mcmeta.animation.frames.length; e += 1) {
        const a = this.mcmeta.animation.frames[e];

        if (typeof a === 'object') this.frames.push({ index: a.index, duration: Math.max(a.time, 1) / this.interval });
        else this.frames.push({ index: a, duration: t / this.interval });
      }
    } else {
      this.interval = this.mcmeta.animation.interpolate ? 1 : t;
      const e = this.texture.height / this.texture.width;
      for (let a = 0; a < e; a += 1) this.frames.push({ index: a, duration: t / this.interval });
    }
  }

  private draw(frameIndex = 0, ticks = 0): void {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.context.imageSmoothingEnabled = this.texture.width > this.canvas.width;
    this.context.globalAlpha = 1;

    this.context.drawImage(
      this.texture,
      0,
      this.texture.width * this.frames[frameIndex].index,
      this.texture.width,
      this.texture.width,
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );

    if (this.mcmeta.animation.interpolate) {
      this.context.globalAlpha = ticks / this.frames[frameIndex].duration;
      this.context.drawImage(
        this.texture,
        0,
        this.texture.width * this.frames[(frameIndex + 1) % this.frames.length].index,
        this.texture.width,
        this.texture.width,
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
    await this.load();

    this.encoder = new GIFEncoder(this.texture.width * this.factor, this.texture.width * this.factor);
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
}
