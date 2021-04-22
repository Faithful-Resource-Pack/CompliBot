/* eslint-disable no-unused-vars */
/* global process */

const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

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

			try {
				await getContributors(client, settings.C32_RESULTS);
				//await getContributors(client, settings.C64_RESULTS);
			}
			catch (err) {
				console.trace(err)
			}
		
		}
	}
}