/*eslint-env node*/

const { autoPush } = require('../functions/autoPush.js')
const fs = require('fs')

const { date } = require('../functions/utility/date.js')
const DEBUG    = (process.env.DEBUG == 'true')

/**
 * Push files from local storage to GitHub
 * @author Juknum
 * @param {String} COMMIT_MESSAGE
 */
async function doPush(COMMIT_MESSAGE = `AutoPush passed textures from ${date()}`) {

	/* JAVA 32x *********************************************************************************************************************/
	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.17/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.17', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.17/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.17/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.17)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.16.5/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.16.5', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.16.5/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.16.5/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.16.5)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.15.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.15.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.15.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.15.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.15.2)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.14.4/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.14.4', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.14.4/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.14.4/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.14.4)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.13.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.13.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.13.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.13.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.13.2)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.12.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.12.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.12.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.12.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.12.2)`)
	}
	
	/* JAVA 64x *********************************************************************************************************************/

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.17/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.17', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.17/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.17/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.17)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.16.5/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.16.5', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.16.5/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.16.5/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.16.5)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.15.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.15.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.15.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.15.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.15.2)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.14.4/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.14.4', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.14.4/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.14.4/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.14.4)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.13.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.13.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.13.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.13.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.13.2)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.12.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.12.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.12.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.12.2/assets/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.12.2)`)
	}
	
	/* BEDROCK ******************************************************************************************************************/

	if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-32x/1.16.210/textures`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-32x', 'Jappa-1.16.210', COMMIT_MESSAGE, './texturesPush/Compliance-Bedrock-32x/1.16.210')
		fs.rmdirSync(`./texturesPush/Compliance-Bedrock-32x/1.16.210/textures/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Bedrock-32x (1.16.210)`)
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-64x/1.16.210/textures`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-64x', 'Jappa-1.16.210', COMMIT_MESSAGE, './texturesPush/Compliance-Bedrock-64x/1.16.210')
		fs.rmdirSync(`./texturesPush/Compliance-Bedrock-64x/1.16.210/textures/`, { recursive: true })
		if (DEBUG) console.log(`PUSHED TO GITHUB: Compliance-Bedrock-64x (1.16.210)`)
	}

	/* JSON ********************************************************************************************************************/
	await autoPush('Compliance-Resource-Pack', 'JSON', 'main', COMMIT_MESSAGE, './json/')
	if (DEBUG) console.log(`PUSHED TO GITHUB: JSON`)
}

/**
 * Check if a directory is empty
 * @param {String} dirname 
 * @returns true if empty
 */
function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true
	else return false
}

exports.doPush = doPush