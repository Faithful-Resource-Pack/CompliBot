const { autoPush } = require('../functions/autoPush.js');
const fs = require('fs');

const BRANCH_BEDROCK = 'Jappa-1.16.200';
const BRANCH_JAVA    = 'Jappa-1.17';
const COMMIT_MESSAGE = `AutoPush passed textures from ${date()}`;

async function doPush() {

	/* JAVA *********************************************************************************************************************/
	
	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', BRANCH_JAVA, COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', BRANCH_JAVA, COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x`);
	}

	/* BEDROCK ******************************************************************************************************************/

	if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-32x/textures`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-32x', BRANCH_BEDROCK, COMMIT_MESSAGE, './texturesPush/Compliance-Bedrock-32x/')
		fs.rmdirSync(`./texturesPush/Compliance-Bedrock-32x/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Bedrock-32x`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-64x/textures`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-64x', BRANCH_BEDROCK, COMMIT_MESSAGE, './texturesPush/Compliance-Bedrock-64x/')
		fs.rmdirSync(`./texturesPush/Compliance-Bedrock-64x/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Bedrock-64x`);
	}
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}

function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true;
	else return false;
}

exports.doPush = doPush;