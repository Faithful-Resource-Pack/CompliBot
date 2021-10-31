const prefix = process.env.PREFIX;
const Discord = require('discord.js');

const colors = require('../../resources/colors');

const { string, stringsStartsWith } = require('../../resources/strings');
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser');
const { getMember } = require("../../helpers/getMember");

module.exports = {
	name: 'kill',
	description: string('command.description.kill'),
	category: 'Fun',
	guildOnly: true,
	uses: string('command.use.mods'),
	syntax: `${prefix}kill <@user> [weapon / leave empty]\n${prefix}kill <user id> [weapon / leave empty]\n${prefix}kill <username> [weapon / leave empty]\n${prefix}kill <nickname> [weapon / leave empty]`,
	example: `${prefix}kill Sei the beans`,
	async execute(client, message, args) {
		if (!args.length) return warnUser(message, string('command.args.none_given'))


		const memberId = await getMember(message, args[0])
		if (memberId == undefined) return warnUser(message, string('command.kill.specify_user'))

		const member = await message.guild.members.fetch(memberId)

		const weapon = args.slice(1).join(' ')

		let result = weapon.length > 0 ? string('command.kill.weapon_response') : stringsStartsWith('command.kill.responses.')[Math.floor(Math.random() * stringsStartsWith('command.kill.responses.').length)]

		result = result.replace('%player%', member.displayName)
		result = result.replace('%weapon%', weapon)

		const embed = new Discord.MessageEmbed()
			.setDescription(result)
			.setColor(colors.BLUE)
		const embedMessage = await message.reply({ embeds: [embed] })
		await addDeleteReact(embedMessage, message, true);
	}
}
