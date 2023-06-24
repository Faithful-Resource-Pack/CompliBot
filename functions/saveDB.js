const { mkdirSync, writeFileSync } = require("fs");
const allCollection = require("../helpers/firestorm/all");

const pushToGitHub = require("../functions/pushToGitHub");
const { join } = require("path");

/**
 * Save the Database distant files to local, then push them to the JSON repository (using allCollection as base)
 * @author Juknum
 * @param {String} commitMessage
 */
module.exports = async function saveDB(commitMessage) {
	const folderPath = join(process.cwd(), "json/database/");

	mkdirSync(folderPath, { recursive: true });

	for (const [key, collection] of Object.entries(allCollection)) {
		let text = JSON.stringify(await collection.read_raw(), null, 0);
		writeFileSync(join(folderPath, key + ".json"), text, { flag: "w+", encoding: "utf-8" });
	}

	pushToGitHub("Faithful-Resource-Pack", "Database", "main", commitMessage, "./json/");
};
