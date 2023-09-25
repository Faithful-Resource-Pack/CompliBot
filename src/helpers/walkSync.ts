import { readdirSync, statSync } from "fs";

/**
 * Return an array of all filepaths in a directory
 * @param dir
 * @param filelist recursion
 * @returns array of file paths
 */
export default function walkSync(dir: string, filelist: string[] = []) {
	if (dir[dir.length - 1] != "/") dir = dir.concat("/");
	const files = readdirSync(dir);
	files.forEach((file) => {
		if (statSync(dir + file).isDirectory()) filelist = walkSync(dir + file + "/", filelist);
		else filelist.push(dir + file);
	});
	return filelist;
}
