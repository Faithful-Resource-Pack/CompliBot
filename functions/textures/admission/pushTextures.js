/*eslint-env node*/

const fs = require('fs')

const { pushToGitHub } = require('../../pushToGitHub')
const { date } = require('../../../helpers/date.js')

const DEBUG = process.DEBUG == "true" ? true : false

/**
 * Push files from local storage to GitHub
 * @author Juknum
 * @param {String} COMMIT_MESSAGE
 */
async function pushTextures(COMMIT_MESSAGE = `Autopush passed textures from ${date()}`) {

	const REPO_JAVA = ['Compliance-Java-32x', 'Compliance-Java-64x']
	const REPO_BEDROCK = ['Compliance-Bedrock-32x', 'Compliance-Bedrock-64x']

	const BRANCHES_JAVA = ['1.18', '1.17.1', '1.16.5', '1.15.2', '1.14.4', '1.13.2', '1.12.2']
	const BRANCHES_BEDROCK = ['1.17.0', '1.16.220']

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