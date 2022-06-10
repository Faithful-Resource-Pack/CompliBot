import { MessageEmbed } from '@client';
import { Canvas, createCanvas, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import getMeta from './getMeta';

type Options = {
  url: string;
  embed?: MessageEmbed;
  name?: string;
  factor?: 32 | 16 | 8 | 4 | 2 | 1 | 0.5 | 0.25;
  orientation?: 'portrait' | 'landscape' | 'none'; // default is none
};

export async function magnifyCanvas(options: Options): Promise<Canvas> {
  return Promise.all([getMeta(options.url), loadImage(options.url)]).then(([dimension, imageToDraw]) => {
    let { factor } = options;

    // If no factor was given it tries maximizing the image output size
    if (!factor) {
      const surface = dimension.width * dimension.height;

      if (surface <= 256) factor = 32; // 16²px or below
      if (surface > 256) factor = 16; // 16²px
      if (surface > 1024) factor = 8; // 32²px
      if (surface > 4096) factor = 4; // 64²px
      if (surface > 65636) factor = 2;

      // 262144 = 512²px
      if (surface >= 262144) factor = 1;
    } else if (dimension.width * factor * (dimension.height * factor) > 262144) {
      do {
        factor /= 2;
      } while (dimension.width * factor * (dimension.height * factor) > 262144);
    }

    const [width, height] = [dimension.width * factor, dimension.height * factor];

    const canvas = createCanvas(
      options.orientation === undefined || options.orientation === 'none' || options.orientation === 'portrait'
        ? Math.round(width)
        : Math.round(width * (16 / 9)),
      options.orientation === undefined || options.orientation === 'none' || options.orientation === 'landscape'
        ? Math.round(height)
        : Math.round(height * (16 / 9)),
    );

    const context = canvas.getContext('2d');
    context.imageSmoothingEnabled = false;
    context.drawImage(
      imageToDraw,
      options.orientation === undefined || options.orientation === 'none' || options.orientation === 'portrait'
        ? 0
        : Math.round((width * (16 / 9)) / 4), // landscape
      options.orientation === undefined || options.orientation === 'none' || options.orientation === 'landscape'
        ? 0
        : Math.round((height * (16 / 9)) / 4), // portrait
      Math.round(width),
      Math.round(height),
    );

    return canvas;
  });
}

export default async function magnifyAttachment(options: Options): Promise<[MessageAttachment, MessageEmbed]> {
  return magnifyCanvas(options)
    .then((canvas) => [
      new MessageAttachment(canvas.toBuffer('image/png'), `${options.name ?? 'magnified.png'}`),
      options.embed,
    ]);
}
