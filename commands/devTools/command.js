const prefix = process.env.PREFIX;

const strings  = require('../../res/strings');
const settings = require('../../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const { warnUser } = require('../../functions/warnUser.js');
const { parseArgs } = require('../../functions/utility/parseArgs.js');

module.exports = {
	name: 'command',
	aliases: ['com'],
	description: 'testing flags in commands',
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}command [-s]`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {

			args = parseArgs(args);
			console.log(args);

		}
	}
}