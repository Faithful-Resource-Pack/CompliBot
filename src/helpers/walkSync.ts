import { readdirSync, statSync } from "fs";

/**
 * Return an array of all filepaths in a directory
 * @author Juknum, Evorp
 * @param dir
 * @param filelist recursion
 * @returns array of file paths
 */
export default function walkSync(dir: string, filelist: string[] = []) {
	// add trailing slash if not present
	if (dir.at(-1) != "/") dir += "/";
	for (const file of readdirSync(dir)) {
		if (statSync(dir + file).isDirectory())
			// read directories inside directories recursively
			filelist = walkSync(dir + file + "/", filelist);
		else filelist.push(dir + file);
	}
	return filelist;
}
