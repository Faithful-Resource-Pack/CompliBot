import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import settings from "@json/dynamic/settings.json";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("info").setDescription("General info about CompliBot."),
	async execute(interaction: ChatInputCommandInteraction) {
		const embed = new EmbedBuilder()
			.setTitle("Hi, I'm CompliBot. I was made for the Faithful Discord servers.")
			.setDescription(`And I think I turned out pretty well.`)
			.addFields(
				{
					name: "Features",
					value:
						"\
						\n- Real-time texture interaction using `/texture`, `/compare`, and `/cycle`. \
						\n- Check resource pack progress with `/missing` or check your contributions with `/about`. \
						\n- Image manipulation utilities such as `/magnify`, `/tile`, `/palette`, and `/animate`.",
					inline: true
				},
				{
					name: "Developing",
					value:
						"I'm fully open source (written in TypeScript and Discord.js) and can be cloned at my GitHub repository [here](https://github.com/faithful-resource-pack/complibot). \
						\n\nIf you're interested in developing, contact <@!473860522710794250>, <@!360249987927638016>, or <@!173336582265241601> for more information.",
					inline: true
				}
			)
			.setThumbnail(settings.images.bot);

		interaction.reply({ embeds: [embed], ephemeral: true });
	},
};
