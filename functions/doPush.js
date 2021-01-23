const { autoPush } = require('../functions/autoPush.js');
const fs = require('fs');

const BRANCH_BEDROCK = 'Jappa-1.16.200';
const BRANCH_JAVA    = 'Jappa-1.17';
const COMMIT_MESSAGE = `AutoPush passed textures from ${date()}`;

async function doPush() {
	const dirs = ['Compliance-Java-32x','Compliance-Java-64x','Compliance-Bedrock-32x','Compliance-Bedrock-64x'];
	dirs.forEach(dir => {
		if (dir.includes('Bedrock')) {
			if(!isEmptyDir(`./texturesPush/${dir}/textures`)) {
				autoPush('Compliance-Resource-Pack', dir, BRANCH_BEDROCK, COMMIT_MESSAGE, `./texturesPush/${dir}`).then(() => {
					fs.rmdirSync(`./texturesPush/${dir}/textures/`, { recursive: true });
					console.log(`PUSHED TO GITHUB: ${dir}`);
				});
			}
		}
		else {
			if(!isEmptyDir(`./texturesPush/${dir}/assets`)) {
				autoPush('Compliance-Resource-Pack', dir, BRANCH_JAVA, COMMIT_MESSAGE, `./texturesPush/${dir}`).then(() => {
					fs.rmdirSync(`./texturesPush/${dir}/assets/`, { recursive: true });
					console.log(`PUSHED TO GITHUB: ${dir}`);
				});
			}
		}
	});
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