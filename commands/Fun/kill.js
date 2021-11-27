const prefix = process.env.PREFIX;;

const strings = require('../../resources/strings.json');
const settings = require('../../resources/settings.json');

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { addDeleteReact } = require('../../helpers/addDeleteReact');
const { warnUser } = require('../../helpers/warnUser');
const { getMember } = require("../../helpers/getMember");

module.exports = {
	name: 'kill',
	description: strings.command.description.kill,
	category: 'Fun',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}kill <@user> [weapon / leave empty]\n${prefix}kill <user id> [weapon / leave empty]\n${prefix}kill <username> [weapon / leave empty]\n${prefix}kill <nickname> [weapon / leave empty]`,
	example: `${prefix}kill Sei the beans`,
	async execute(client, message, args) {
		if (!args.length) return warnUser(message, strings.command.args.none_given)


		const memberId = await getMember(message, args[0])
		if (memberId == undefined) return warnUser(message, strings.command.kill.specify_user)

		const member = await message.guild.members.fetch(memberId)

		const weapon = args.slice(1).join(' ')

		//let result = weapon.length > 0 ? strings.command.kill.weapon_response : Object.values(strings.command.kill.responses)[Math.floor(Math.random() * Object.values(strings.command.kill.responses).length)]
		
		// use this one to test specific responses
		let result = weapon.length > 0 ? strings.command.kill.weapon_response : Object.values(strings.command.kill.responses)[36]

		result = result.replace('%player%', member.displayName)
		result = result.replace('%weapon%', weapon)

		const embed = new MessageEmbed()
			.setDescription(result)
			.setColor(settings.colors.blue)

		let embedMessage
		let response36 = Object.values(strings.command.kill.responses)[36].replace('%player%', member.displayName).replace('%weapon%', weapon)
		let response37 = Object.values(strings.command.kill.responses)[37].replace('%player%', member.displayName).replace('%weapon%', weapon)


		if (result == response36 || result == response37) {
			embed.setDescription(`${result}\n\n**Need an explanation?**`)

			const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('explBtn')
					.setLabel('Yes, please explain')
					.setStyle('PRIMARY'),
			);

			embedMessage = await message.reply({ embeds: [embed], components: [row] })

			const filter = i => i.customId === 'explBtn' && i.user.id === message.author.id;

			const collector = message.channel.createMessageComponentCollector({ filter, time: 1000 * 60 }); // 1 minute

			collector.on('collect', async i => {
				if (i.customId === 'explBtn') {
					embed.setDescription(`${result}\n\n`)

					if (result == response36) embed.addField('Explanation:', `- Appears when the player dies to fall damage in water, which is ordinarily impossible because water cancels all fall damage.\n\n- Currently replicable in 1.13.x-1.18.x by taking fall damage on a waterlogged slab in a minecart, or by having a trident enchanted with an insanely high level of Riptide, then trying to use it inside deep water bodies.\n\n- Before 1.16, this message was translated as: *${member.displayName} fell out of the water.*`)
					else if (result == response37) embed.addField('Explanation:', '- Appears when the player is killed by a bee that was holding a renamed item during the player\'s death.')

					return await embedMessage.edit({ embeds: [embed], components: [] }).catch(() => { })
				}
			});

			collector.on('end', async () => { return await embedMessage.edit({ embeds: [embed.setDescription(result)], components: [] }).catch(() => { }) } );
		}

		else embedMessage = await message.reply({ embeds: [embed] })
		await addDeleteReact(embedMessage, message, true);
	}
}
