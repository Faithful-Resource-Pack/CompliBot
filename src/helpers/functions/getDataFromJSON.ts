import fs from "fs";
import path from "path";

interface Options {
	relative_path: string;
	filename: string;
	default_value?: "{}";
}
export function getData(options: Options): JSON {
	let data: JSON;
	let folder: string = path.resolve(__dirname, options.relative_path);
	let file: string = path.resolve(folder, options.filename);

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
