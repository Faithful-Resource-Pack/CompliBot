const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { warnUser } = require('../../functions/warnUser.js');
const { walkSync } = require('../../functions/walkSync');

const { doPush }            = require('../../functions/doPush.js');
const { textureSubmission } = require('../../functions/textures_submission/textureSubmission.js');
const { textureCouncil }    = require('../../functions/textures_submission/textureCouncil.js');
const { textureRevote }     = require('../../functions/textures_submission/textureRevote.js');
const { getResults }        = require('../../functions/textures_submission/getResults.js');

const fs = require('fs');

const { date } = require('../../functions/utility/date.js');

function isEmptyDir(dirname){
	if (!fs.existsSync(dirname)) return true;
	else return false;
}

module.exports = {
	name: 'hotfix',
	aliases: ['fix'],
	description: strings.HELP_DESC_HOTFIX,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}hotfix <something>`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

		/*
			console.log('Hotfix started');

			if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-32x/1.16.210/textures`)) {
				await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-32x', 'Jappa-1.16.210', `AutoPush passed textures from ${date()}`, './texturesPush/Compliance-Bedrock-32x/')
				fs.rmdirSync(`./texturesPush/Compliance-Bedrock-32x/1.16.210/textures/`, { recursive: true });
				console.log(`PUSHED TO GITHUB: Compliance-Bedrock-32x (1.16.210)`);
			}

			if (!isEmptyDir(`./texturesPush/Compliance-Bedrock-64x/1.16.210/textures`)) {
				await autoPush('Compliance-Resource-Pack', 'Compliance-Bedrock-64x', 'Jappa-1.16.210', `AutoPush passed textures from ${date()}`, './texturesPush/Compliance-Bedrock-64x/')
				fs.rmdirSync(`./texturesPush/Compliance-Bedrock-64x/1.16.210/textures/`, { recursive: true });
				console.log(`PUSHED TO GITHUB: Compliance-Bedrock-64x (1.16.210)`);
			}

			console.log('Hotfix ended')

		*/
		/*
		await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 4);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 4);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 3);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 3);							// 3 DAYS OFFSET
		//await    textureCouncil(client, settings.C32_SUBMIT_2,  settings.C32_SUBMIT_3, settings.C32_RESULTS, 1);	// 1 DAYS OFFSET
		//await     textureRevote(client, settings.C32_SUBMIT_3,  settings.C32_RESULTS,  3);							// 3 DAYS OFFSET
		
		// C64x
		await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 4);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 4);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 3);							// 3 DAYS OFFSET
		await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 3);							// 3 DAYS OFFSET
		//await    textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1);	// 1 DAYS OFFSET
		//await     textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3);							// 3 DAYS OFFSET
		*/
		/*
		await getResults(client, settings.C32_RESULTS);
		await getResults(client, settings.C64_RESULTS);
		
		*/
		await doPush();	// Push them trough GitHub
		}
	}
}