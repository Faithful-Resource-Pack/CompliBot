import { Client, Message, SelectMenuInteraction, MessageEmbed } from "@client";
import { SelectMenu } from "@interfaces";
import { info } from "@helpers/logger";
import { MessageInteraction } from "discord.js";
import { textureComparison } from "@functions/canvas/stitch";

export const menu: SelectMenu = {
	selectMenuId: "compareSelect",
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
		else interaction.deferReply();

		const [id, display] = interaction.values[0].split("__");
		const [embed, magnified] = await textureComparison(interaction.client as Client, id, display);

		embed.setFooter({
			text: `${embed.footer.text} | ${interaction.user.id}`,
			iconURL: embed.footer.iconURL,
		});

		try {
			message.delete();
		} catch (err) {
			interaction.editReply({
				content: await interaction.getEphemeralString({ string: "Error.Message.Deleted" }),
			});
		}

		interaction
			.editReply({ embeds: [embed], files: magnified ? [magnified] : null })
			.then((message: Message) => message.deleteButton(true));
	},
};
