import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import getMeta from './getMeta';
import GIFEncoder from './GIFEncoder';

interface Options {
  url: string;
  mcmeta?: Object;
  name?: string;
  magnify?: boolean;
}

export async function animateAttachment(options: Options): Promise<MessageAttachment> {
  return getMeta(options.url).then(async (dimensions) => {
    if (options.magnify === true) {
      let factor: number = 1;
      const surface = dimensions.width * dimensions.width;

      if (surface <= 256) factor = 32; // 16²px or below
      if (surface > 256) factor = 16; // 16²px
      if (surface > 1024) factor = 8; // 32²px
      if (surface > 4096) factor = 4; // 64²px
      if (surface > 65636) factor = 2;
      // 262144 = 512²px
      else if (surface >= 262144) factor = 1;

      dimensions.width *= factor;
      dimensions.height *= factor;
    }

    const baseIMG = await loadImage(options.url);
    const baseCanvas: Canvas = createCanvas(dimensions.width, dimensions.height);
    const baseContext: CanvasRenderingContext2D = baseCanvas.getContext('2d');
    baseContext.imageSmoothingEnabled = false;
    baseContext.drawImage(baseIMG, 0, 0, baseCanvas.width, baseCanvas.height);

    const canvas: Canvas = createCanvas(dimensions.width, dimensions.height);
    const context: CanvasRenderingContext2D = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;

    // ! TODO: Width & Height properties from MCMETA are not supported yet

    const MCMETA: any =
      typeof options.mcmeta === 'object'
        ? options.mcmeta
        : {
            animation: {},
          };
    if (!MCMETA.animation) MCMETA.animation = {};

    const frametime: number = MCMETA.animation.frametime || 1;
    const frames = [];

    // MCMETA.animation.frames is defined
    if (Array.isArray(MCMETA.animation.frames) && MCMETA.animation.frames.length > 0) {
      for (let i = 0; i < MCMETA.animation.frames.length; i++) {
        const frame = MCMETA.animation.frames[i];

        if (typeof frame === 'number')
          frames.push({
            index: frame,
            duration: frametime,
          });
        if (typeof frame === 'object')
          frames.push({
            index: frame.index || 1,
            duration: frame.time || frametime,
          });
        else
          frames.push({
            index: i,
            duration: frametime,
          });
      }
    }

    // MCMETA.animation.frames is not defined
    else
      for (let i = 0; i < dimensions.height / dimensions.width; i++)
        frames.push({
          index: i,
          duration: frametime,
        });

    // Draw frames
    const encoder = new GIFEncoder(dimensions.width, dimensions.width);
    encoder.start();
    encoder.setTransparent(true);

    context.globalCompositeOperation = 'copy';

    // interpolation
    if (MCMETA.animation.interpolate) {
      let limit: number = frametime;

      for (let i = 0; i < frames.length; i++) {
        for (let y = 1; y <= limit; y++) {
          context.clearRect(0, 0, canvas.width, canvas.height);
          context.globalAlpha = 1;

          // frame i (always 100% opacity)
          context.drawImage(
            baseCanvas, // image
            0,
            dimensions.width * frames[i].index, // sx, sy
            dimensions.width,
            dimensions.width, // sWidth, sHeight
            0,
            0, // dx, dy
            canvas.width,
            canvas.width, // dWidth, dHeight
          );

          context.globalAlpha = ((100 / frametime) * y) / 100;

          // frame i + 1 (transition)
          context.drawImage(
            baseCanvas, // image
            0,
            dimensions.width * frames[(i + 1) % frames.length].index, // sx, sy
            dimensions.width,
            dimensions.width, // sWidth, sHeight
            0,
            0, // dx, dy
            canvas.width,
            canvas.width, // dWidth, dHeight
          );

          encoder.addFrame(context);
        }
      }
    }

    // no interpolation
    else
      for (let i = 0; i < frames.length; i++) {
        context.clearRect(0, 0, dimensions.width, dimensions.height);
        context.globalAlpha = 1;

        context.drawImage(
          baseCanvas, // image
          0,
          dimensions.width * frames[i].index, // sx, sy
          dimensions.width,
          dimensions.width, // sWidth, sHeight
          0,
          0, // dx, dy
          canvas.width,
          canvas.width, // dWidth, dHeight
        );

        encoder.setDelay(50 * (frames[i].duration === 1 ? 3 : frames[i].duration));
        encoder.addFrame(context);
      }

    encoder.finish();
    return new MessageAttachment(encoder.out.getData(), options.name ? options.name : 'animation.gif');
  });
}
