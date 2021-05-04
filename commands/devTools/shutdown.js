const prefix  = process.env.PREFIX;
const Discord = require('discord.js');

const strings  = require('../../res/strings');
const colors   = require('../../res/colors');
const settings = require('../../settings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

module.exports = {
	name: 'shutdown',
	aliases: ['logout'],
	description: strings.HELP_DESC_SHUTDOWN,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			await message.inlineReply('Shutting down...');
			await process.exit();
		}
    else {
			var embed = new Discord.MessageEmbed()
				.setAuthor(message.client.user.username, settings.BOT_IMG)
				.setDescription(`Banned <@${message.author.id}> \nReason: trying to stop me`)
				.setColor(colors.BLUE)
				.setTimestamp();
			const embedMessage = await message.inlineReply(embed);
		}
	}
};
