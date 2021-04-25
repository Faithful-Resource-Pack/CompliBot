/* eslint-disable no-unused-vars */
/* global process */

const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

const { getResults } = require('../../functions/textures_submission/getResults.js');
const { date }       = require('../../functions/utility/date.js');
const { doPush }     = require('../../functions/doPush.js');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { getContributors } = require('../../functions/textures_submission/getContributors.js');

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

			/*await getResults(client, settings.C64_RESULTS, 1);
			await getResults(client, settings.C64_RESULTS, 5);
			await getResults(client, settings.C64_RESULTS, 6);
			await getResults(client, settings.C64_RESULTS, 7);
			await getResults(client, settings.C64_RESULTS, 8);
			await getResults(client, settings.C64_RESULTS, 9);
			await getResults(client, settings.C64_RESULTS, 14);*/
		
			await doPush(`Manual AutoPush, executed by: ${message.author.username} (${date()})`);
		} else return
	}
}