const { readdirSync, statSync } = require("fs");

/**
 * Return an array of all filepaths in a directory
 * @param {String} dir
 * @param {String[]} filelist
 * @returns array of file paths
 */
module.exports = function walkSync(dir, filelist = []) {
	if (dir[dir.length - 1] != "/") dir = dir.concat("/");
	const files = readdirSync(dir);
	files.forEach((file) => {
		if (statSync(dir + file).isDirectory()) filelist = walkSync(dir + file + "/", filelist);
		else filelist.push(dir + file);
	});
	return filelist;
};
