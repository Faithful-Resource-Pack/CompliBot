const prefix = process.env.PREFIX;

const Discord = require("discord.js")
const strings = require('../../resources/strings.json')
const settings = require('../../resources/settings.json')
const { warnUser } = require('../../helpers/warnUser')

module.exports = {
	name: 'rule',
	aliases: ['rules'],
	description: strings.command.description.rules,
	category: 'Moderation',
	guildOnly: true,
	uses: strings.command.use.mods,
	syntax: `${prefix}rule <n>`,
	flags: '',
	example: `${prefix}rule 1`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Manager") || role.name.includes("Moderator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)

		const RULES = Object.values(strings.rules)

		let thumbnail = settings.images.plain;
		let color = settings.colors.c32;

		if (message.guild.id == settings.guilds.em.id)
			thumbnail = settings.images.cf_plain;

		let rule;

		if (message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) {
			if (args[0] == 'all') rule = -1;
		} else warnUser(message, "Only Managers can do that!")

		if (rule != -1) rule = parseInt(args[0], 10)

		if (rule <= RULES.length && rule > 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${RULES[rule - 1].number} ${RULES[rule - 1].title}`)
				.setColor(color)
				.setThumbnail(settings.images.rules)
				.setDescription(RULES[rule - 1].description);

			return await message.reply({ embeds: [embed] });
		}

		else if (rule == -1) {

			let embed = new Discord.MessageEmbed()
				.setTitle(`Rules of the Faithful Discord Servers`)
				.setColor(color)
				.setThumbnail(thumbnail)
				.setDescription("**Not knowing these is not an excuse for misbehaving, and you can and will be held accountable for your actions. Punishments are up to the discretion of the moderators, and harassing them is only going to make your punishment worse.**\n\nUse /modping or directly ping a moderator if rules are being broken. Please do not mini-mod!")
			await message.channel.send({ embeds: [embed] })

			for (let i = 0; i < RULES.length; i++) {
				if (RULES[i].date == undefined) { // skip changes note
					let embedRule = new Discord.MessageEmbed()
						.setColor(color)
						.setTitle(`${RULES[i].number} ${RULES[i].title}`)
						.setDescription(RULES[i].description)

					await message.channel.send({ embeds: [embedRule] });
				}

				else if (RULES[i].enabled == "true" || RULES[i].enabled == true) { // only for the changes note
					const embedExpandedRules = new Discord.MessageEmbed()
						.setColor(color)
						.setDescription("A much more in-depth version of our rules, punishment appeal information, and our thought process into giving punishments can be found here: https://docs.faithfulpack.net/pages/moderation/expanded-server-rules.")

					const embedChanges = new Discord.MessageEmbed()
						.setTitle(`Latest changes as of the ${RULES[i].date}`)
						.setColor(color)
						.setDescription(RULES[i].description)
						.setFooter(`The rules are subject to change at any time for any reason.`, thumbnail)

					await message.channel.send({ embeds: [embedExpandedRules] })
					await message.channel.send({ embeds: [embedChanges] })
				}
			}

			if (!message.deleted) await message.delete();
		}

		// number is out of range
		else return warnUser(message, `You have to specify a number between 1 and ${RULES.length} included.`)

	}
}
