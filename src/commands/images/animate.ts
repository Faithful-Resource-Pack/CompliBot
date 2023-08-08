import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageEmbed } from "@client";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { animateImage } from "@functions/canvas/animate";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("animate")
		.setDescription("Animate a vertical tilesheet.")
		.addStringOption((option) =>
			option
				.setName("style")
				.setDescription("The style of animation to use (Default is None)")
				.addChoices(
					{ name: "Prismarine", value: "Prismarine" },
					{ name: "Fire", value: "Fire" },
					{ name: "Flowing Lava", value: "Flowing Lava" },
					{ name: "Still Lava", value: "Still Lava" },
					{ name: "Magma", value: "Magma" },
					{ name: "None", value: "None"}
				)
				.setRequired(false),
		)
		.addAttachmentOption((o) =>
		o.setName("image").setDescription("The tilesheet to animate").setRequired(false),
		),
	execute: (interaction: CommandInteraction) => {
		const style = interaction.options.getString("style", false) ?? "None";
		generalSlashCommandImage(interaction, animateImage, {
			style: style,
			name: "animated.gif",
			embed: new MessageEmbed().setTitle(`Animated ${style === "None" ? 'with no style' : `as ${style}`}`).setImage("attachment://animated.gif"),
		});
	},
};