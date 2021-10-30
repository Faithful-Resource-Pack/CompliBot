const prefix = process.env.PREFIX;

const Discord = require('discord.js')
const colors = require('../../resources/colors')
const { string } = require('../../resources/strings')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'clear',
	description: string('command.description.clear'),
	category: 'Moderation',
	guildOnly: true,
	uses: string('command.use.mods'),
	syntax: `${prefix}clear <amount>`,
	example: `${prefix}clear 10`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, string('command.no_permission'))

		if (!args.length) return warnUser(message, string('command.args.none_given'))
		if (isNaN(args)) return await message.reply({ content: string('command.args.invalid.not_number') })
		if (args > 100) return await message.reply({ content: string('command.clear.too_much') })
		if (args < 1) return await message.reply({ content: string('command.clear.not_enough') })

		var amount = (parseInt(args, 10) + 1) > 100 ? 100 : parseInt(args, 10) + 1
		const messages = await message.channel.messages.fetch({ limit: amount })
		await message.channel.bulkDelete(messages);
		var embed = new Discord.MessageEmbed()
			.setAuthor(`${message.author.tag} bulk deleted ${args} messages!`)
			.setColor(colors.RED)
			.setThumbnail(message.author.displayAvatarURL())
			.setDescription(`[Jump to location](${message.url})\n\n**Server**: ${message.guild}\n\n**Channel**: <#${message.channel.id}>`)
			.setTimestamp()

		await client.channels.cache.get('798676864599195655').send({ embeds: [embed] })
	}
};
