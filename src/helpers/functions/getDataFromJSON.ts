import fs from "fs";
import path from "path";

interface Options {
	relative_path: string;
	filename: string;
	default_value?: "{}";
}

/**
 * Read data from json
 * @author Juknum
 * @param options which file
 * @returns json file
 */
export function getData(options: Options) {
	let data: JSON;
	let folder = path.resolve(__dirname, options.relative_path);
	let file = path.resolve(folder, options.filename);

	try {
		data = JSON.parse(fs.readFileSync(file).toString());
	} catch (_err) {
		// file/folder isn't valid
		if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

		fs.writeFileSync(file, options.default_value || "{}");

		return getData(options); // check another time
	}
	return data;
}
