import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, Client, Message } from "@src/Extended Discord";
import get from "axios";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder().setName("quote").setDescription("Truely inspiring."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let image = await get("https://inspirobot.me/api?generate=true");
		let embed = new MessageEmbed();
		embed.setImage(image.data);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
