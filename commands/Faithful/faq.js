const prefix = process.env.PREFIX;

const Discord = require("discord.js");
const settings = require("../../resources/settings.json");
const strings = require("../../resources/strings.json");
const { warnUser } = require("../../helpers/warnUser");

const FAQS = Object.values(strings.faq);

module.exports = {
	name: "faq",
	answer: strings.command.description.faq,
	category: "Faithful",
	guildOnly: true,
	uses: strings.command.use.anyone,
	syntax: `${prefix}faq [keyword]`,
	example: `${prefix}faq bot offline\n${prefix}faq submit\n\nMANAGER ONLY:\n${prefix}faq all`,
	async execute(client, message, args) {
		let color = settings.colors.brand;
		let embed;
		let embedArray = [];

		if (args[0] == "all") {
			if (message.member.permissions.has(Discord.Permissions.FLAGS.ADMINISTRATOR)) {
				for (let i = 0; i < FAQS.length; i++) {
					embed = new Discord.MessageEmbed()
						.setTitle(FAQS[i].question)
						.setColor(color)
						.setDescription(FAQS[i].answer)
						.setFooter({ text: `Keywords: ${Object.values(FAQS[i].keywords).join(" • ")}` });

					embedArray.push(embed);

					if ((i + 1) % 5 == 0) {
						await message.channel.send({ embeds: embedArray });
						embedArray = [];
					}
				}

				if (embedArray.length) await message.channel.send({ embeds: embedArray }); // sends the leftovers if exists
				if (message.deletable) await message.delete();
			} else warnUser(message, "Only Managers can do that!");
		} else {
			args = args.join(" ");
			for (let i = 0; i < FAQS.length; i++) {
				if (Object.values(FAQS[i].keywords).includes(args.toLowerCase())) {
					embed = new Discord.MessageEmbed()
						.setTitle(`FAQ: ${FAQS[i].question}`)
						.setThumbnail(settings.images.question)
						.setColor(settings.colors.blue)
						.setDescription(FAQS[i].answer)
						.setFooter({ text: `Keywords: ${Object.values(FAQS[i].keywords).join(" • ")}` });
					await message.reply({ embeds: [embed] });
				}
			}

			if (embed === undefined) return warnUser(message, "This keyword does not exist or is not attributed!");
		}
	},
};
