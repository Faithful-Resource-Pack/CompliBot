import fs from "fs";
import path from "path";

interface GetOptions {
	relative_path: string;
	filename: string;
	default_value?: "{}";
}


interface SetOptions {
	relative_path: string;
	filename: string;
	data: {};
}

/**
 * Read data from JSON
 * @author Juknum
 * @param options which file
 * @returns json file
 */
export function getData(options: GetOptions) {
	let data: JSON;
	const folder = path.resolve(__dirname, options.relative_path);
	const file = path.resolve(folder, options.filename);

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


/**
 * Set data to a given JSON
 * @author Juknum
 * @param options data to set
 */
export function setData(options: SetOptions) {
	let folder = path.resolve(__dirname, options.relative_path);
	const file = path.resolve(folder, options.filename);

	try {
		fs.writeFileSync(file, JSON.stringify(options.data));
	} catch (_err) {
		// file/folder isn't valid
		if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

		fs.writeFileSync(file, JSON.stringify(options.data));
	}
}
