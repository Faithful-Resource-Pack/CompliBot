const settings = require("@resources/settings.json");

const DEBUG = process.env.DEBUG.toLowerCase() == "true";

const { mkdirSync, writeFileSync } = require("fs");

const pushToGitHub = require("@functions/pushToGitHub");
const { join } = require("path");
const { default: axios } = require("axios");
const devLogger = require("@helpers/devLogger");

/**
 * push all raw api collections to github
 * @author Evorp, Juknum
 * @param {import("discord.js").Client} client
 * @param {String} commitMessage
 * @param {{org?: String, repo?: String, branch?: String}} params
 */
module.exports = async function saveDB(client, commitMessage = "Daily Backup", params = {}) {
	if (!params.org) params.org = settings.backup.git.org;
	if (!params.repo) params.repo = settings.backup.git.repo;
	if (!params.branch) params.branch = settings.backup.git.branch;

	const folderPath = join(process.cwd(), "json", "database");
	mkdirSync(folderPath, { recursive: true });

	let successfulPushes = [];
	for (const [filename, url] of Object.entries(settings.backup.urls)) {
		try {
			const fetched = (
				await axios.get(process.env.API_URL + url, {
					headers: {
						// for privileged collections like addons, ignored if not needed
						bot: process.env.API_TOKEN,
					},
				})
			).data;

			writeFileSync(join(folderPath, `${filename}.json`), JSON.stringify(fetched), {
				flag: "w+",
				encoding: "utf-8",
			});

			successfulPushes.push(filename);
		} catch (err) {
			devLogger(client, JSON.stringify(err?.response?.data ?? err), {
				isJson: true,
				title: `Failed to backup collection "${filename}"`,
			});
			if (DEBUG) console.error(err?.response?.data ?? err);
		}
	}

	if (DEBUG) console.log(`Downloaded database files: ${successfulPushes}`);
	await pushToGitHub(params.org, params.repo, params.branch, commitMessage, "./json/");
};
