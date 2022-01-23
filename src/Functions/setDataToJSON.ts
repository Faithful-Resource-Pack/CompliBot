import fs from "fs";
import path from "path";

interface Options {
	relative_path: string;
	filename: string;
	data: JSON;
}
export function setData(options: Options): void {
	let folder: string = path.resolve(__dirname, options.relative_path);
	let file: string = path.resolve(folder, options.filename);

	try {
		fs.writeFileSync(file, JSON.stringify(options.data));
	} catch (_err) {
		// file/folder isn't valid
		if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

		fs.writeFileSync(file, JSON.stringify(options.data));
	}
}
