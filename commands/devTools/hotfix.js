/*const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const { warnUser } = require('../../functions/warnUser.js');
const { walkSync } = require('../../functions/walkSync');

const { doPush }            = require('../../functions/doPush.js');
const { textureSubmission } = require('../../functions/textures_submission/textureSubmission.js');
const { textureCouncil }    = require('../../functions/textures_submission/textureCouncil.js');
const { textureRevote }     = require('../../functions/textures_submission/textureRevote.js');
const { getResults }        = require('../../functions/textures_submission/getResults.js');

module.exports = {
	name: 'hotfix',
	aliases: ['fix'],
	description: 'Fix something, may change at anytime',
	guildOnly: false,
	uses: 'Bot Developers',
	syntax: `${prefix}hotfix <something>`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			
			await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
			await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 5);							// 5 DAYS OFFSET
			await    textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1);	// 1 DAYS OFFSET
			await     textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3);							// 3 DAYS OFFSET
			

			await getResults(client, settings.C64_RESULTS);
			await doPush(`Manual AutoPush, executed by: ${message.author.username} (${date()})`);
		}
	}
}

function date() {
	var today = new Date();
	var dd = String(today.getDate()).padStart(2, '0');
	var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
	var yyyy = today.getFullYear();
	return mm + '/' + dd + '/' + yyyy;
}*/