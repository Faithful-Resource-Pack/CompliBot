const { writeFile } = require("fs/promises");
const { join } = require("path");
const allCollection = require("../helpers/firestorm/all");

const OUT_PATH = join(join(process.cwd(), "resources/"), "settings.json");
const JSON_REPLACER = null;
const JSON_SPACE = 0;

/**
 * Fetch settings file from the VPS into resources/settings.json
 * @author Juknum
 * @returns {Promise<Object>}
 */
module.exports = async () => {
	if (process.env.FETCH_SETTINGS != "true") return;
	const settings = await allCollection.settings.read_raw();
	return writeFile(OUT_PATH, JSON.stringify(settings, JSON_REPLACER, JSON_SPACE), {
		flag: "w",
		encoding: "utf-8",
	});
};