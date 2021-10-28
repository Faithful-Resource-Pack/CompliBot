const prefix = process.env.PREFIX;
const Discord = require('discord.js');

const { string, stringsStartsWith } = require('../../resources/strings');
const colors = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'kill',
	description: string('command.description.kill'),
	guildOnly: true,
	uses: string('command.use.mods'),
	category: 'Fun',
	syntax: `${prefix}kill <@user> [weapon]`,
	example: `${prefix}kill Sei the beans`,
	async execute(client, message, args) {
		if (!args.length) return warnUser(message, string('command.args.none_given'))

		const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.username === args[0] || m.displayName === args[0])

		if (!member) return warnUser(message, string('command.kill.specify_user'))

		const weapon = args.slice(1).join(' ')

		let result = weapon.length > 0 ? string('command.kill.weapon_response') : stringsStartsWith('command.kill.responses.')[Math.floor(Math.random() * stringsStartsWith('command.kill.responses.').length)]

		result = result.replace('%player%', member.displayName)
		result = result.replace('%weapon%', weapon)

		const embed = new Discord.MessageEmbed()
			.setDescription(result)
			.setColor(colors.BLUE)
		await message.reply({ embeds: [embed] })
	}
}
