/*eslint-env node*/

const fs = require("fs");

const { pushToGitHub } = require("../../pushToGitHub");
const { date } = require("../../../helpers/date.js");

const DEBUG = process.DEBUG == "true" ? true : false;
const settings = require("../../../resources/settings.json");

/**
 * Push files from local storage to GitHub
 * @author Juknum
 * @param {String} COMMIT_MESSAGE
 */
async function pushTextures(COMMIT_MESSAGE = `Autopush passed textures from ${date()}`) {
	const REPO_JAVA = Object.values(settings.repositories.repo_name.java);
	const REPO_BEDROCK = Object.values(settings.repositories.repo_name.bedrock);

	const BRANCHES_JAVA = settings.versions.java;
	const BRANCHES_BEDROCK = settings.versions.bedrock;

	for (let repoKey of REPO_JAVA) {
		for (let branch of BRANCHES_JAVA) {
			if (checkFolder(`./texturesPush/${repoKey.repo}/${branch}/assets`)) {
				try {
					await pushToGitHub(
						repoKey.org,
						repoKey.repo,
						`${branch}`,
						COMMIT_MESSAGE,
						`./texturesPush/${repoKey.repo}/${branch}/`,
					);
				} catch (e) {
					// branch doesn't exist, octokit causes an error
				}
				fs.rmdirSync(`./texturesPush/${repoKey.repo}/${branch}/assets/`, { recursive: true });
			}
			if (DEBUG) console.log(`PUSHING: ${repoKey.repo} (${branch})`);
		}
	}

	for (let repoKey of REPO_BEDROCK) {
		for (let branch of BRANCHES_BEDROCK) {
			if (checkFolder(`./texturesPush/${repoKey.repo}/${branch}/textures`)) {
				await pushToGitHub(
					repoKey.org,
					repoKey.repo,
					`${branch}`,
					COMMIT_MESSAGE,
					`./texturesPush/${repoKey.repo}/${branch}/`,
				);

				fs.rmdirSync(`./texturesPush/${repoKey.repo}/${branch}/textures/`, { recursive: true });
			}
			if (DEBUG) console.log(`PUSHING: ${repoKey.repo} (${branch})`);
		}
	}
}

/**
 * Check if a directory is empty
 * @param {String} dirname
 * @returns true if empty
 */
const checkFolder = (folderPath) => {
	if (!folderPath) throw Error("folder path is required!");

	const isFolderExist = fs.existsSync(folderPath);
	return isFolderExist;
};

exports.pushTextures = pushTextures;
