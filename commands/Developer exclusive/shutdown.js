const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const strings = require('../../resources/strings.json');
const settings = require('../../resources/settings.json')

const { MessageEmbed } = require('discord.js')

module.exports = {
	name: 'shutdown',
	aliases: ['logout', 'die'],
	description: strings.command.description.shutdown,
	category: 'Developer exclusive',
	guildOnly: false,
	uses: strings.command.use.devs,
	syntax: `${prefix}shutdown`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {
			await message.reply({ content: 'Shutting down...' });
			await process.exit();
		}
		else {
			var embed = new MessageEmbed()
				.setAuthor(message.client.user.username, settings.images.bot)
				.setDescription(`Banned <@${message.author.id}> \nReason: trying to stop me lmao`)
				.setColor(settings.colors.blue)
				.setTimestamp();
			await message.reply({ embeds: [embed] });
		}
	}
};
