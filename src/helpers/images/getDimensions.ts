import axios from "axios";
import sizeOf from "image-size";

/**
 * Get dimensions of an image and validate url
 * @author Juknum
 * @param imageURL url to find dimensions of
 * @returns image size
 */
export default async function getDimensions(imageURL: string) {
	const buf: Buffer = (await axios.get(imageURL, { responseType: "arraybuffer" })).data;

	// fixes bug where buf was undefined
	if (!buf) throw new Error(`Buffer for getDimensions invalid: ${buf}`);

	return sizeOf(buf);
}
