const prefix  = process.env.PREFIX;
const Discord = require('discord.js');

const strings = require('../../resources/strings');
const colors  = require('../../resources/colors');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'kill',
	description: strings.HELP_DESC_KILL,
	guildOnly: true,
	uses: strings.COMMAND_USES_MODS,
	category: 'Fun',
	syntax: `${prefix}kill <@user> [weapon]`,
	example: `${prefix}kill Sei the beans`,
	async execute(client, message, args) {
		if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN)

		const member = message.mentions.members.first() || message.guild.members.cache.find(m => m.username === args[0] || m.displayName === args[0])

		if (!member) return warnUser(message, strings.KILL_SPECIFY_USER)

    const weapon = args.slice(1).join(' ')

    let result = weapon.length > 0 ? strings.KILL_WEAPON_RESPONSE : strings.KILL_RESPONSES[Math.floor(Math.random() * strings.KILL_RESPONSES.length)]

    result = result.replace('%player%', member.displayName)
    result = result.replace('%weapon%', weapon)

    const embed = new Discord.MessageEmbed()
      .setDescription(result)
      .setColor(colors.BLUED)
    await message.reply({embeds: [embed]})
	}
}
