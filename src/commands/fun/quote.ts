import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed, Client, Message } from "@client";
import axios from "axios";

export const command: SlashCommand = {
	data: new SlashCommandBuilder().setName("quote").setDescription("Truely inspiring."),
	execute: async (interaction: CommandInteraction, client: Client) => {
		let image = await axios.get("https://inspirobot.me/api?generate=true");
		let embed = new MessageEmbed();
		embed.setImage(image.data);

		interaction.reply({ embeds: [embed], fetchReply: true }).then((message: Message) => message.deleteButton());
	},
};
