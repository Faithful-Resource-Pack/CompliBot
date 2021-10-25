const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const { string } = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser.js');

module.exports = {
	name: 'say',
	description: string('command.description.say'),
	guildOnly: true,
	uses: string('command.use.devs'),
	category: 'Developer exclusive',
	syntax: `${prefix}say [message] [attach a file]`,
	example: `${prefix}say hello there`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			if (!args.length) return warnUser(message, string('command.args.none_given'));

			else {
				if (message.attachments.size > 0) await message.channel.send({ content: args.join(" "), files: [message.attachments.first().url] })
				else await message.channel.send({ content: args.join(" ") });

				await message.delete().catch();
			}
		} else return
	}
};
