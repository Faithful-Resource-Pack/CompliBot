/* eslint-disable no-unused-vars */
const prefix   = process.env.PREFIX;
const strings  = require('../../ressources/strings');
const settings = require('../../ressources/settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

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
			
			/* Nothing */

		} else return
	}
}