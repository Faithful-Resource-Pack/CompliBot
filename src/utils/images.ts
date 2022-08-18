import path from 'path';

export class Images {
  /**
   * Get the images from the `./images` directory.
   * @param {String} filepath - The filepath to the image from the `./images` directory.
   * @returns {String} The image path.
   */
  public static get(filepath: string): string {
    return path.join(__dirname, '../../images', filepath);
  }
}
