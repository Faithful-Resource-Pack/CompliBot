import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction, Message } from "@client";
import getImage from "@helpers/getImage";
import { animateToAttachment, MCMETA } from "@helpers/images/animate";
import mcmetaList from "@json/mcmetas.json";
import { loadImage } from "@napi-rs/canvas";
import { magnify } from "@helpers/images/magnify";

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
	async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const style = interaction.options.getString("style", false) ?? "none";
		let image = interaction.options.getAttachment("image", false)?.url;
		if (!image) image = await getImage(interaction);

		const mcmeta: MCMETA = mcmetaList[style];

		// magnify beforehand since you can't magnify a gif currently
		const { magnified } = await magnify(image, true);
		const file = await animateToAttachment(await loadImage(magnified), mcmeta, `${style}.gif`);
		await interaction.editReply({ files: [file] }).then((message: Message) => message.deleteButton());
	},
};
