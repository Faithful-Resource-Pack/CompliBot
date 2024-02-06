import { EmbedBuilder } from "@client";
import { AnyInteraction } from "@interfaces/interactions";

/**
 * Send a series of embeds in batches to reduce spam from sending individually
 * @author Evorp
 * @param interaction interaction to get channel to send from
 * @param embedArray what to send
 * @param max how big each batch should be (has to be below 10)
 */
export default async function embedSeries(
	interaction: AnyInteraction,
	embedArray: EmbedBuilder[],
	max = 5,
) {
	const groupedEmbeds = embedArray.reduce((acc: EmbedBuilder[][], cur, i) => {
		if (i % max === 0) acc.push([]);
		acc.at(-1).push(cur);
		return acc;
	}, []);

	// this also handles any residual embeds, easier than iterating
	while (groupedEmbeds.length) await interaction.channel.send({ embeds: groupedEmbeds.shift() });
}
