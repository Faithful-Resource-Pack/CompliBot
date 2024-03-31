import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

interface GetOptions {
	relativePath: string;
	filename: string;
	default_value?: "{}";
}

interface SetOptions {
	relativePath: string;
	filename: string;
	data: object;
}

/**
 * Read data from JSON
 * @author Juknum
 * @param options which file
 * @returns json file
 */
export function getData(options: GetOptions) {
	let data = {};
	const folder = resolve(__dirname, options.relativePath);
	const file = resolve(folder, options.filename);

	try {
		data = JSON.parse(readFileSync(file).toString());
	} catch (_err) {
		// file/folder isn't valid
		if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

		writeFileSync(file, options.default_value || "{}");

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
	const folder = resolve(__dirname, options.relativePath);
	const file = resolve(folder, options.filename);

	try {
		writeFileSync(file, JSON.stringify(options.data));
	} catch (_err) {
		// file/folder isn't valid
		if (!existsSync(folder)) mkdirSync(folder, { recursive: true });

		writeFileSync(file, JSON.stringify(options.data));
	}
}
