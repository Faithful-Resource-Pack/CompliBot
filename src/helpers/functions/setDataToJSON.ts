import fs from "fs";
import path from "path";

interface Options {
	relative_path: string;
	filename: string;
	data: {};
}
/**
 * Set data to a given json
 * @author Juknum
 * @param options data to set
 */
export function setData(options: Options) {
	let folder = path.resolve(__dirname, options.relative_path);
	let file = path.resolve(folder, options.filename);

	try {
		fs.writeFileSync(file, JSON.stringify(options.data));
	} catch (_err) {
		// file/folder isn't valid
		if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

		fs.writeFileSync(file, JSON.stringify(options.data));
	}
}
