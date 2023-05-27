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

		const RULES = strings.rules;
		const RULES_INFO = strings.rules_info;

		const thumbnail = message.guild.id == settings.guilds.em.id
			? settings.images.cf_plain
			: settings.images.plain;

		let rule;
		let embedArray = [];
		let embedRule;

		if (message.member.roles.cache.some(role => role.name.includes("Manager") || role.id === '747839021421428776')) {
			if (args[0] == 'all') rule = -1;
		} else warnUser(message, "Only Managers can do that!")

		if (rule != -1) rule = parseInt(args[0], 10)

		if (rule <= RULES.length && rule > 0) {
			const embed = new Discord.MessageEmbed()
				.setTitle(`${RULES[rule - 1].number} ${RULES[rule - 1].title}`)
				.setColor(settings.colors.c32)
				.setThumbnail(settings.images.rules)
				.setDescription(RULES[rule - 1].description);

			return await message.reply({ embeds: [embed] });
		}

		else if (rule == -1) {

			let embed = new Discord.MessageEmbed()
				.setTitle(RULES_INFO.heading.title)
				.setColor(settings.colors.c32)
				.setThumbnail(thumbnail)
				.setDescription(RULES_INFO.heading.description)

			await message.channel.send({ embeds: [embed] })

			for (let i = 0; i < RULES.length; i++) {
				embedRule = new Discord.MessageEmbed()
					.setColor(settings.colors.c32)
					.setTitle(`${RULES[i].number} ${RULES[i].title}`)
					.setDescription(RULES[i].description)

				embedArray.push(embedRule);

				if ((i+1) % 5 == 0) {
					await message.channel.send({ embeds: embedArray });
					embedArray = [];
				}
			}

			if (embedArray.length) await message.channel.send({ embeds: embedArray }); // sends the leftovers if exists

			const embedExpandedRules = new Discord.MessageEmbed()
				.setColor(settings.colors.c32)
				.setTitle(RULES_INFO.expanded_rules.title)
				.setDescription(RULES_INFO.expanded_rules.description);

			let embedChanges; // needs to be declared outside the block to prevent block scope shenanigans

			if (RULES_INFO.changes.enabled) { // only for the changes note
				embedChanges = new Discord.MessageEmbed()
					.setTitle(RULES_INFO.changes.title)
					.setColor(settings.colors.c32)
					.setDescription(RULES_INFO.changes.description)
					.setFooter(`The rules are subject to change at any time for any reason.`, thumbnail)
			}

			await message.channel.send({ embeds: [embedExpandedRules, embedChanges] })

			if (!message.deleted) await message.delete();
		}

		// number is out of range
		else return warnUser(message, `You have to specify a number between 1 and ${RULES.length} included.`)

	}
}
