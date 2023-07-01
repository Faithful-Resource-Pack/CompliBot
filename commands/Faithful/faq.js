const prefix = process.env.PREFIX;

const { Permissions, MessageEmbed } = require("discord.js");
const { colors } = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");
const warnUser = require("../../helpers/warnUser");

module.exports = {
	name: "faq",
	answer: strings.command.description.faq,
	category: "Faithful",
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}faq [keyword]`,
	example: `${prefix}faq bot offline\n${prefix}faq submit\n\nMANAGER ONLY:\n${prefix}faq all`,
	async execute(client, message, args) {
		if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR))
			return warnUser(message, "Only Managers can use this command!");

		let embedArray = [];

		let i = 0;
		for (let faq of strings.faq) {
			embedArray.push(
				new MessageEmbed()
					.setTitle(faq.question)
					.setColor(colors.brand)
					.setDescription(faq.answer)
					.setFooter({ text: `Keywords: ${faq.keywords.join(" • ")}` }),
			);

			if ((i + 1) % 5 == 0) {
				// groups the embeds in batches of 5 to reduce API spam
				await message.channel.send({ embeds: embedArray });
				embedArray = [];
			}
			++i;
		}

		if (embedArray.length) await message.channel.send({ embeds: embedArray }); // sends the leftovers if exists
		if (message.deletable) await message.delete();
	},
};
