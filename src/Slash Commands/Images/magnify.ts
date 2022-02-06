import { SlashCommand } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "@src/Client/interaction";
import { slashCommandImage } from "@functions/slashCommandImage";
import { magnifyAttachment } from "@functions/canvas/magnify";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder().setName("magnify").setDescription("Magnify an image"),
	execute: async (interaction: CommandInteraction) => {
		slashCommandImage({
			interaction: interaction,
			limit: 10,
			response: {
				title: 'Magnified',
				url: 'attachment://magnified.png',
				attachment: magnifyAttachment
			}
		})
	},
};
