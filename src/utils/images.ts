import { ISettings } from '@interfaces';

export class Images {
  /**
   * Get the images from the imageBaseURL setting.
   * @param {String} filepath - The filepath to the image from the imageBaseURL setting.
   * @returns {String} The image path.
   */
  public static get(filepath: string): string {
    const settings: ISettings = JSON.configLoad('settings.json');
    const basePath = settings.imageBaseURL;

    // add timestamp to prevent caching
    if (filepath.includes('?')) return `${basePath}${filepath}`;
    return `${basePath}${filepath}?${Date.now()}`;
  }

  /**
   * Get the images from the imageBaseURL setting but adapted to an Embed Thumbnail size.
   * @param filepath - The filepath to the image from the imageBaseURL setting.
   * @returns {String} The image path.
   */
  public static getAsEmbedThumbnail(filepath: string): string {
    return this.get(`${filepath}?w=128&h=128&enlarge=1`);
  }

  /**
   * Get the images from the imageBaseURL setting but adapted to an Embed Image size.
   * @param {String} filepath - The filepath to the image from the imageBaseURL setting.
   * @returns {String} The image path.
   */
  public static getAsEmbedImage(filepath: string): string {
    return this.get(`${filepath}?w=512&h=512&enlarge=1`);
  }

  /**
   * Get the images from the imageBaseURL setting but adapted to an Embed Footer iconURL size.
   */
  public static getAsEmbedFooterOrAuthor(filepath: string): string {
    return this.get(`${filepath}?w=32&h=32&enlarge=1`);
  }

  /**
   * Get the images from the imageBaseURL setting but adapted to the options you gave.
   * @param {String} filepath - The filepath to the image from the imageBaseURL setting.
   * @param {({ width: number, height: number })} options - The size options for the image.
   * @returns {String} The image path.
   */
  public static getAs(filepath: string, options: { width?: number, height?: number }): string {
    let str = `${filepath}?`;
    if (options.width) str += `w=${options.width}&`;
    if (options.height) str += `h=${options.height}&`;

    return this.get(`${str}enlarge=1`);
  }
}
