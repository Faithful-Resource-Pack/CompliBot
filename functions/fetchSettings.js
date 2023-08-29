const { writeFile } = require("fs/promises");
const { join } = require("path");

/**
 * Download remote settings file
 * @author Juknum
 * @param {Boolean?} format whether to format the setting file being downloaded
 */
module.exports = async (format = false) => {
	if (process.env.FETCH_SETTINGS.toLowerCase() !== "true") return;
	const settings = (await axios.get(`https://api.faithfulpack.net/v2/settings/raw`)).data;
	const OUT_PATH = join(process.cwd(), "resources", "settings.json");
	const space = format ? 4 : 0;
	return writeFile(OUT_PATH, JSON.stringify(settings, null, space), {
		flag: "w",
		encoding: "utf-8",
	});
};
