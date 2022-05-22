import axios from 'axios';
import sizeOf from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';

export default function (imageURL: string): Promise<ISizeCalculationResult> {
  return new Promise((resolve, reject) => {
    axios
      .get(imageURL, {
        responseType: 'arraybuffer',
      })
      .then((response) => {
        const { data } = response;
        const buf = Buffer.from(data, 'base64');
        const size = sizeOf(buf);
        resolve(size);
      })
      .catch(reject);
  });
}
