const prefix   = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const Discord  = require('discord.js');
const strings  = require('../../ressources/strings');
const colors   = require('../../ressources/colors');
const settings = require('../../ressources/settings');

module.exports = {
	name: 'shutdown',
	aliases: ['logout', 'die'],
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
				.setDescription(`Banned <@${message.author.id}> \nReason: trying to stop me lmao`)
				.setColor(colors.BLUE)
				.setTimestamp();
			await message.inlineReply(embed);
		}
	}
};
