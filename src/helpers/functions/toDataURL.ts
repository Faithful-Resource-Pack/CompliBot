/**
 * Convert Buffer to DataURL (base64 url)
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @returns {string} DataURL
 */
export default function toDataURL(buffer: Buffer, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${buffer.toString('base64')}`;
}
