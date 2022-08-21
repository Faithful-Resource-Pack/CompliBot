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
    return `${basePath}${filepath}?${Date.now()}`;
  }
}
