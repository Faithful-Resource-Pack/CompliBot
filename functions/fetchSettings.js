const { writeFile } = require("fs/promises");
const { join } = require("path");
const allCollection = require("../helpers/firestorm/all");


/**
 * Download remote settings file
 * @author Juknum
 * @param {Boolean?} format whether to format the setting file being downloaded
 * @returns {Promise<Object>}
 */
module.exports = async (format = false) => {
	if (process.env.FETCH_SETTINGS !== "true") return;
	const settings = await allCollection.settings.read_raw();
	const OUT_PATH = join(join(process.cwd(), "resources/"), "settings.json");
	const space = format ? 4 : 0;
	return writeFile(OUT_PATH, JSON.stringify(settings, null, space), {
		flag: "w",
		encoding: "utf-8",
	});
};
