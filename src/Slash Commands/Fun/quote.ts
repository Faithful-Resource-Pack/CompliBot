import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import CommandInteraction from "@src/Client/commandInteraction";
import MessageEmbed from "@src/Client/embed";
import Client from "@src/Client";
import Message from "@src/Client/message";
import get from "axios";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder().setName("quote").setDescription("Truely inspiring."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let image = await get("https://inspirobot.me/api?generate=true");
		let embed = new MessageEmbed();
		embed.setImage(image.data);

		interaction.reply({ embeds: [embed] });
		const message: Message = await interaction.fetchReply() as Message;
		message.deleteReact({ authorMessage: message, authorID: interaction.user.id, deleteAuthorMessage: false });
	},
};
