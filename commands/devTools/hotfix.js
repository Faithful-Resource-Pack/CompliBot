/* eslint-disable no-unused-vars */
/* global process */

const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

const { getResults } = require('../../functions/textures_submission/getResults.js');
const { date }       = require('../../functions/utility/date.js');
const { doPush }     = require('../../functions/doPush.js');
const { textureSubmission } = require('../../functions/textures_submission/textureSubmission.js')
const { textureCouncil }    = require('../../functions/textures_submission/textureCouncil.js')
const { textureRevote }     = require('../../functions/textures_submission/textureRevote.js')

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

			/*let valURL = args[0];
			message.channel.messages.fetch(valURL.split('/').pop()).then(async msg => {
				await msg.react('⬆️');
				await msg.react('⬇️');
				if (!message.deleted) await message.delete();
			})*/
			

			// Compliance 32x
			/*await textureSubmission(client, settings.C32_SUBMIT_1,  settings.C32_SUBMIT_2, 3)
			await textureSubmission(client, settings.C32_SUBMIT_1B, settings.C32_SUBMIT_2, 3)
			await textureCouncil(client, settings.C32_SUBMIT_2,  settings.C32_SUBMIT_3, settings.C32_RESULTS, 1)
			await textureRevote(client, settings.C32_SUBMIT_3,  settings.C32_RESULTS,  3)
	
			// Compliance 64x
			await textureSubmission(client, settings.C64_SUBMIT_1,  settings.C64_SUBMIT_2, 3)
			await textureSubmission(client, settings.C64_SUBMIT_1B, settings.C64_SUBMIT_2, 3)
			await textureCouncil(client, settings.C64_SUBMIT_2,  settings.C64_SUBMIT_3, settings.C64_RESULTS, 1)
			await textureRevote(client, settings.C64_SUBMIT_3,  settings.C64_RESULTS,  3)*/

			await getResults(client, settings.C32_RESULTS, 6);
		
			await doPush(`Manual AutoPush, executed by: ${message.author.username} (${date()})`);
		} else return
	}
}