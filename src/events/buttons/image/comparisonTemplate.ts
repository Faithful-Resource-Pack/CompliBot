import { Component } from "@interfaces";
import { info } from "@helpers/logger";
import { Client, Message, ButtonInteraction, EmbedBuilder } from "@client";
import { magnify } from "@images/magnify";
import { parseDisplay } from "@functions/textureComparison";
import { formatName } from "@helpers/sorter";
import { loadImage } from "@napi-rs/canvas";
import stitch from "@helpers/images/stitch";

export default {
	id: "comparisonTemplate",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Comparison template requested!`);
		await interaction.deferReply({ ephemeral: true });

		const message: Message = interaction.message as Message;
		const display = message.embeds[0].footer.text.split(":")[1].trim();
		const packs = parseDisplay(display);

		const loadedImages = [];
		let i = 0;
		for (const packSet of packs) {
			loadedImages.push([]);
			for (const pack of packSet) {
				loadedImages[i].push(await loadImage(formatName(pack)[1]));
			}
			++i;
		}

		const longestRow = loadedImages.reduce((acc, item) => Math.max(acc, item.length), 0);
		const stitched = await stitch(loadedImages, longestRow == 3 ? 4 : 2);

		const magnified = (
			await magnify({ image: await loadImage(stitched), name: "magnified.png" })
		)[0];

		const embed = new EmbedBuilder()
			.setImage("attachment://magnified.png")
			.setTitle(`Comparison Template`);

		return await interaction.editReply({
			embeds: [embed],
			files: [magnified],
		});
	},
} as Component;
