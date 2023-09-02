const { writeFile } = require("fs/promises");
const { join } = require("path");
const FETCH_SETTINGS = process.env.FETCH_SETTINGS.toLowerCase() == "true";
const { default: axios } = require("axios");

/**
 * Download remote settings file
 * @author Juknum
 * @param {Boolean?} format whether to format the setting file being downloaded
 */
module.exports = async (format = false) => {
	if (!FETCH_SETTINGS) return;
	const settings = (await axios.get(`${process.env.API_URL}settings/raw`)).data;
	const OUT_PATH = join(process.cwd(), "resources", "settings.json");
	return writeFile(OUT_PATH, JSON.stringify(settings, null, format ? 4 : 0), {
		flag: "w",
		encoding: "utf-8",
	});
};
