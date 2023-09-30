import axios from "axios";
import sizeOf from "image-size";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

/**
 * Get dimensions of an image and validate url
 * @author Juknum
 * @param imageURL url to find dimensions of
 * @returns image size
 */
export default async function (imageURL: string): Promise<ISizeCalculationResult> {
	const data = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;
	const buf = Buffer.from(data, "base64");
	const size = sizeOf(buf);
	return size;
}
