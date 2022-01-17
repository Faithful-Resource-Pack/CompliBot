/*eslint-env node*/

const fs = require('fs')

const { pushToGitHub } = require('../../pushToGitHub')
const { date } = require('../../../helpers/date.js')

const DEBUG = process.DEBUG == "true" ? true : false
const settings = require('../../../resources/settings.json')

/**
 * Push files from local storage to GitHub
 * @author Juknum
 * @param {String} COMMIT_MESSAGE
 */
async function pushTextures(COMMIT_MESSAGE = `Autopush passed textures from ${date()}`) {

	const REPO_JAVA = [settings.repositories.repo_name.java.c32, settings.repositories.repo_name.java.c64]
	const REPO_BEDROCK = [settings.repositories.repo_name.bedrock.c32, settings.repositories.repo_name.bedrock.c64]

	const BRANCHES_JAVA = settings.versions.java
	const BRANCHES_BEDROCK = settings.versions.bedrock

	for (let i = 0; REPO_JAVA[i]; i++) {
		for (let j = 0; BRANCHES_JAVA[j]; j++) {

			if (checkFolder(`./texturesPush/${REPO_JAVA[i]}/${BRANCHES_JAVA[j]}/assets`)) {
				await pushToGitHub('Compliance-Resource-Pack', REPO_JAVA[i], `Jappa-${BRANCHES_JAVA[j]}`, COMMIT_MESSAGE, `./texturesPush/${REPO_JAVA[i]}/${BRANCHES_JAVA[j]}/`)
				fs.rmdirSync(`./texturesPush/${REPO_JAVA[i]}/${BRANCHES_JAVA[j]}/assets/`, { recursive: true })

				if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-${BRANCHES_JAVA[j]})`)
			}

		}
	}

	for (let i = 0; REPO_BEDROCK[i]; i++) {
		for (let j = 0; BRANCHES_BEDROCK[j]; j++) {

			if (checkFolder(`./texturesPush/${REPO_BEDROCK[i]}/${BRANCHES_BEDROCK[j]}/textures`)) {
				await pushToGitHub('Compliance-Resource-Pack', REPO_BEDROCK[i], `Jappa-${BRANCHES_BEDROCK[j]}`, COMMIT_MESSAGE, `./texturesPush/${REPO_BEDROCK[i]}/${BRANCHES_BEDROCK[j]}/`)
				fs.rmdirSync(`./texturesPush/${REPO_BEDROCK[i]}/${BRANCHES_BEDROCK[j]}/textures/`, { recursive: true })

				if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-${BRANCHES_BEDROCK[j]})`)
			}

		}
	}

}

/**
 * Check if a directory is empty
 * @param {String} dirname 
 * @returns true if empty
 */
const checkFolder = folderPath => {
	if (!folderPath) throw Error('folder path is required!')

	const isFolderExist = fs.existsSync(folderPath)
	return isFolderExist
}


exports.pushTextures = pushTextures