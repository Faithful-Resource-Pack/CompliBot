import { Canvas, CanvasRenderingContext2D, createCanvas, loadImage } from 'canvas';
import { MessageAttachment } from 'discord.js';
import getMeta from './getMeta';

interface Options {
  left: {
    url: string;
  };
  right: {
    url: string;
  };
  name?: string;
}

export async function stickAttachment(options: Options): Promise<MessageAttachment> {
  try {
    const canvas = await stickCanvas(options);
    return new MessageAttachment(canvas.toBuffer('image/png'), `${options.name ? options.name : 'sticked.png'}`);
  } catch {
    return null;
  }
}

export async function stickCanvas(options: Options): Promise<Canvas> {
  const [left, right] = [options.left, options.right].map((opt) => ({
    ...opt,
    dimensions: undefined,
    image: undefined,
  }));

  return Promise.all([getMeta(left.url), getMeta(right.url), loadImage(left.url), loadImage(right.url)]).then(
    ([leftMeta, rightMeta, leftImage, rightImage]) => {
      const margin = 10;

      left.dimensions = leftMeta;
      right.dimensions = rightMeta;
      left.image = leftImage;
      right.image = rightImage;

      const canvas: Canvas = createCanvas(
        left.dimensions.width + right.dimensions.width + margin,
        Math.max(left.dimensions.height, right.dimensions.height),
      );
      const context: CanvasRenderingContext2D = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;

      // Draw left image
      context.drawImage(
        left.image,
        0,
        (Math.max(left.dimensions.height, right.dimensions.height) -
          Math.min(left.dimensions.height, right.dimensions.height)) /
          2, // centered in height, using the highest of given images, should be 0 if both are the same height
      );

      // Draw right image
      context.drawImage(
        right.image,
        left.dimensions.width + margin,
        (Math.max(left.dimensions.height, right.dimensions.height) -
          Math.min(left.dimensions.height, right.dimensions.height)) /
          2, // centered in height, using the highest of given images, should be 0 if both are the same height
      );

      return canvas;
    },
  );
}
