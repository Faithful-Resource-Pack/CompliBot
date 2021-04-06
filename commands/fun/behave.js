const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

module.exports = {
	name: 'behave',
	description: strings.HELP_DESC_BEHAVE,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}behave`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			await message.inlineReply(strings.BEHAVE_ANSWER);
		} else return
	}
};
