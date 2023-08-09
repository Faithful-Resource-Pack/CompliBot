const fs = require("fs");

const settings = require("../../resources/settings.json");
const date = require("../../helpers/date.js");

const pushToGitHub = require("../pushToGitHub");
const DEBUG = process.env.DEBUG.toLowerCase() == "true";

/**
 * Push files from local storage to GitHub
 * @author Juknum
 * @param {String?} commitMessage
 */
module.exports = async function pushTextures(
	commitMessage = `Autopush passed textures from ${date()}`,
) {
	const GITHUB_JAVA = Object.values(settings.repositories.repo_name.java);
	const GITHUB_BEDROCK = Object.values(settings.repositories.repo_name.bedrock);

	const BRANCHES_JAVA = settings.versions.java;
	const BRANCHES_BEDROCK = settings.versions.bedrock;

	for (let packGithub of GITHUB_JAVA) {
		for (let branch of BRANCHES_JAVA) {
			if (checkFolder(`./texturesPush/${packGithub.repo}/${branch}`)) {
				if (DEBUG) console.log(`PUSHING: ${packGithub.repo} (${branch})`);
				try {
					await pushToGitHub(
						packGithub.org,
						packGithub.repo,
						`${branch}`,
						commitMessage,
						`./texturesPush/${packGithub.repo}/${branch}/`,
					);
				} catch (e) {
					// branch doesn't exist, octokit causes an error
				}
				fs.rm(`./texturesPush/${packGithub.repo}/${branch}/`, { recursive: true });
			}
		}
	}

	for (let packGithub of GITHUB_BEDROCK) {
		for (let branch of BRANCHES_BEDROCK) {
			if (checkFolder(`./texturesPush/${packGithub.repo}/${branch}`)) {
				if (DEBUG) console.log(`PUSHING: ${packGithub.repo} (${branch})`);
				await pushToGitHub(
					packGithub.org,
					packGithub.repo,
					`${branch}`,
					commitMessage,
					`./texturesPush/${packGithub.repo}/${branch}/`,
				);

				fs.rm(`./texturesPush/${packGithub.repo}/${branch}/`, { recursive: true });
			}
		}
	}
};

/**
 * Check if a directory is empty
 * @param {String} folderPath
 * @returns {Boolean} true if empty
 */
const checkFolder = (folderPath) => {
	if (!folderPath) throw Error("A folder path is required!");

	const isFolderExist = fs.existsSync(folderPath);
	return isFolderExist;
};
