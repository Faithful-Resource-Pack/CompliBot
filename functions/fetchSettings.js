const fs = require("fs/promises");
const path = require("path");
const allCollection = require("../helpers/firestorm/all");

const OUT_PATH = path.join(path.join(process.cwd(), "resources/"), "settings.json");
const JSON_REPLACER = null;
const JSON_SPACE = 0;

/**
 * Fetch distant settings file into the local one
 * @author Juknum
 * @returns {Promise<Object>}
 */
module.exports = async () => {
	const settings = await allCollection.settings.read_raw();
	return fs.writeFile(OUT_PATH, JSON.stringify(settings, JSON_REPLACER, JSON_SPACE), { flag: "w", encoding: "utf-8" });
};

exports.doCheckSettings = doCheckSettings;
