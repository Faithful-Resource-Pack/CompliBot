const prefix = process.env.PREFIX

const Discord = require("discord.js")
const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json')
const { warnUser } = require('../../helpers/warnUser')

const FAQS = Object.values(strings.faq)
const FAQS_extras = Object.values(strings.faq_extras)

module.exports = {
	name: 'faq',
	answer: strings.command.description.faq,
	category: 'Compliance',
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}faq [keyword]`,
	example: `${prefix}faq bot offline\n${prefix}faq submit\n\nADMINS ONLY:\n${prefix}faq all`,
	async execute(client, message, args) {
		let color = settings.colors.c32

		let embed
		// very sloppy solution, but we'll be rewriting this in the new bot soon anyway
		if (message.guild.id == 773983706582482946) {
			if (args[0] == 'all') {
				if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) {
					for (let i = 0; i < FAQS.length; i++) {
						embed = new Discord.MessageEmbed()
							.setTitle(FAQS[i].question)
							.setColor(color)
							.setDescription(FAQS[i].answer)
							.setFooter(`Keywords: ${Object.values(FAQS[i].keywords).join(' | ')}`)
						await message.channel.send({ embeds: [embed] })
					}
					if (!message.deleted) await message.delete()

				} else warnUser(message, "Only Administrators can do that!")
			} else {
				args = args.join(' ')
				for (let i = 0; i < FAQS.length; i++) {
					if (Object.values(FAQS[i].keywords).includes(args.toLowerCase())) {
						embed = new Discord.MessageEmbed()
							.setTitle(`FAQ: ${FAQS[i].question}`)
							.setThumbnail(settings.images.question)
							.setColor(settings.colors.blue)
							.setDescription(FAQS[i].answer)
							.setFooter(`Keywords: ${Object.values(FAQS[i].keywords).join(' | ')}`)
						await message.reply({ embeds: [embed] })
					}
				}

				if (embed === undefined) return warnUser(message, 'This keyword does not exist or is not attributed!')
			}
		}

		else if (message.guild.id == 614160586032414845) {
			if (args[0] == 'all') {
				if (message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) {
					for (let i = 0; i < FAQS_extras.length; i++) {
						embed = new Discord.MessageEmbed()
							.setTitle(FAQS_extras[i].question)
							.setColor(color)
							.setDescription(FAQS_extras[i].answer)
							.setFooter(`Keywords: ${Object.values(FAQS_extras[i].keywords).join(' | ')}`)
						await message.channel.send({ embeds: [embed] })
					}
					if (!message.deleted) await message.delete()

				} else warnUser(message, "Only Administrators can do that!")
			} else {
				args = args.join(' ')
				for (let i = 0; i < FAQS_extras.length; i++) {
					if (Object.values(FAQS_extras[i].keywords).includes(args.toLowerCase())) {
						embed = new Discord.MessageEmbed()
							.setTitle(`FAQ: ${FAQS_extras[i].question}`)
							.setThumbnail(settings.images.question)
							.setColor(settings.colors.blue)
							.setDescription(FAQS_extras[i].answer)
							.setFooter(`Keywords: ${Object.values(FAQS_extras[i].keywords).join(' | ')}`)
						await message.reply({ embeds: [embed] })
					}
				}

				if (embed === undefined) return warnUser(message, 'This keyword does not exist or is not attributed!')
			}
		}


	}
}