const { mkdirSync, writeFileSync } = require("fs");

const pushToGitHub = require("@functions/pushToGitHub");
const { join } = require("path");
const { default: axios } = require("axios");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

// api urls after the slash to fetch from
const collections = {
	addons: `addons`,
	contributions: `contributions/raw`,
	uses: `uses/raw`,
	settings: `settings/raw`,
	users: `users/raw`,
	paths: `paths/raw`,
	textures: `textures/raw`,
};

/**
 * push all raw api collections to github
 * @author Evorp, Juknum
 * @param {String} commitMessage
 */
module.exports = async function saveDB(commitMessage = "Daily Backup") {
	const params = {
		org: "Faithful-Resource-Pack",
		repo: "Database",
		branch: "main",
	};

	const folderPath = join(process.cwd(), "json", "database");
	mkdirSync(folderPath, { recursive: true });

	for (const [filename, url] of Object.entries(collections)) {
		try {
			const fetched = (
				await axios.get(process.env.API_URL + url, {
					headers: {
						bot: process.env.API_TOKEN, // for a few privileged collections like users
					},
				})
			).data;

			writeFileSync(join(folderPath, `${filename}.json`), JSON.stringify(fetched), {
				flag: "w+",
				encoding: "utf-8",
			});
		} catch (err) {
			// probably an axios error
			if (DEBUG) console.error(err?.response?.data ?? err);
		}
	}

	if (DEBUG) console.log(`Downloaded database files: ${Object.keys(collections)}`);
	await pushToGitHub(params.org, params.repo, params.branch, commitMessage, "./json/");
};
