import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, EmbedBuilder } from "@client";
import { generalSlashCommandImage } from "@functions/slashCommandImage";
import { animateImage } from "@images/animate";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("animate")
		.setDescription("Animate a vertical tilesheet.")
		.addStringOption((option) =>
			option
				.setName("style")
				.setDescription("The style of animation to use (Default is None)")
				.addChoices(
					{ name: "Prismarine", value: "prismarine" },
					{ name: "Fire", value: "fire" },
					{ name: "Flowing Lava", value: "flowing_lava" },
					{ name: "Still Lava", value: "still_lava" },
					{ name: "Magma", value: "magma" },
					{ name: "None", value: "none" },
				)
				.setRequired(false),
		)
		.addAttachmentOption((o) =>
			o.setName("image").setDescription("The tilesheet to animate").setRequired(false),
		),
	execute: (interaction: ChatInputCommandInteraction) => {
		const style = interaction.options.getString("style", false) ?? "none";
		generalSlashCommandImage(interaction, animateImage, {
			style: style,
			name: "animated.gif",
			embed: new EmbedBuilder()
				.setTitle(`Animated ${style === "none" ? "" : `as ${style}`}`)
				.setImage("attachment://animated.gif"),
		});
	},
};
