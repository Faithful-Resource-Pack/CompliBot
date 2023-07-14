import axios from "axios";
import sizeOf from "image-size";
import { ISizeCalculationResult } from "image-size/dist/types/interface";

export default async function (imageURL: string): Promise<ISizeCalculationResult> {
	const response = await axios.get(imageURL, { responseType: "arraybuffer" });
	const data = response.data;
	const buf = Buffer.from(data, "base64");
	const size = sizeOf(buf);
	return (size);
}
