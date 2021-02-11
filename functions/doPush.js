const { autoPush } = require('../functions/autoPush.js');
const fs = require('fs');

const BRANCH_BEDROCK = 'Jappa-1.16.200';

async function doPush(COMMIT_MESSAGE) {

	if (COMMIT_MESSAGE == undefined) {
		COMMIT_MESSAGE = `AutoPush passed textures from ${date()}`;
	}

	/* JAVA 32x *********************************************************************************************************************/
	
	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.17/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.17', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.17/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.17/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.17)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.16.5/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.16.5', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.16.5/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.16.5/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.16.5)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.15.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.15.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.15.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.15.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.15.2)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.14.4/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.14.4', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.14.4/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.14.4/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.14.4)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.13.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.13.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.13.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.13.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.13.2)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-32x/1.12.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-32x', 'Jappa-1.12.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-32x/1.12.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-32x/1.12.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-32x (Jappa-1.12.2)`);
	}
	
	/* JAVA 64x *********************************************************************************************************************/

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.17/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.17', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.17/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.17/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.17)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.16.5/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.16.5', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.16.5/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.16.5/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.16.5)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.15.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.15.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.15.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.15.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.15.2)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.14.4/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.14.4', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.14.4/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.14.4/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.14.4)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.13.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.13.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.13.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.13.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.13.2)`);
	}

	if (!isEmptyDir(`./texturesPush/Compliance-Java-64x/1.12.2/assets`)) {
		await autoPush('Compliance-Resource-Pack', 'Compliance-Java-64x', 'Jappa-1.12.2', COMMIT_MESSAGE, './texturesPush/Compliance-Java-64x/1.12.2/')
		fs.rmdirSync(`./texturesPush/Compliance-Java-64x/1.12.2/assets/`, { recursive: true });
		console.log(`PUSHED TO GITHUB: Compliance-Java-64x (Jappa-1.12.2)`);
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