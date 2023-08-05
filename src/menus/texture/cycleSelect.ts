import { Client, Message, SelectMenuInteraction, MessageEmbed } from "@client";
import { SelectMenu } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageInteraction } from "discord.js";
import { cycleComparison } from "@functions/canvas/cycle";

export const menu: SelectMenu = {
	selectMenuId: "cycleSelect",
	execute: async (client: Client, interaction: SelectMenuInteraction) => {
		if (client.verbose) console.log(`${info}Texture selected!`);

		const messageInteraction: MessageInteraction = interaction.message
			.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (
					await interaction.getEphemeralString({ string: "Error.Interaction.Reserved" })
				).replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});
		else interaction.deferUpdate();

		const [id, display] = interaction.values[0].split("__");
		const [embed, giffed] = await cycleComparison(interaction.client as Client, id, display);

		if (embed.footer)
			embed.setFooter({
				text: `${embed.footer.text} | ${interaction.user.id}`,
				iconURL: embed.footer.iconURL,
			});

		try {
			message.delete();
		} catch (err) {
			interaction.channel.send({
				content: await interaction.getEphemeralString({ string: "Error.Message.Deleted" }),
			});
		}

		interaction.channel
			.send({ embeds: [embed], files: giffed ? [giffed] : null })
			.then((message: Message) => message.deleteButton(true));
	},
};
