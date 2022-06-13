import axios from 'axios';
import { MessageAttachment } from 'discord.js';
import JSZip from 'jszip';

export const arrayBufferToBufferCycle = (ab: ArrayBuffer): Buffer => {
  const buffer = Buffer.alloc(ab.byteLength);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; i += 1) {
    buffer[i] = view[i];
  }
  return buffer;
};

export const zipToMA = async (url: string): Promise<Array<MessageAttachment>> => {
  const output: Array<MessageAttachment> = [];

  // get zip as arraybuffer
  const zip: ArrayBuffer = (
    await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    })
  ).data;

  // get files inside the zip as an object: { "filename": "Buffer" }
  const zipFiles: { [key: string]: Buffer } = await JSZip.loadAsync(arrayBufferToBufferCycle(zip))
    .then((z) => {
      const ext = /(.png|.tga)$/;
      const promises = Object.keys(z.files)
        .filter((filename: string) => ext.test(filename.toLowerCase()))
        .map(async (filename: string) => {
          const file = z.files[filename];
          return file.async('nodebuffer').then((buffer: Buffer) => [filename, buffer]);
        });

      return Promise.all(promises);
    })
    .then((res): { [key: string]: Buffer } => res.reduce((acc, val: [key: string, buff: Buffer]) => {
      const splitted: Array<string> = val[0].split('/');
      const key: string = splitted[splitted.length - 1];
      acc[key] = val[1];
      return acc;
    }, {}));

  // convert to MessageAttachment
  Object.keys(zipFiles).forEach((key: string) => {
    output.push(new MessageAttachment(zipFiles[key], key));
  });

  return output;
};
