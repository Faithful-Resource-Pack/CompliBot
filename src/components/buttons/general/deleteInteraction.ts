import { Component } from "@interfaces/components";
import { info } from "@helpers/logger";
import { Client, ButtonInteraction, EmbedBuilder } from "@client";
import { colors } from "@utility/colors";
import { PermissionFlagsBits, PermissionsBitField } from "discord.js";

export default {
	id: "deleteInteraction",
	async execute(client: Client, interaction: ButtonInteraction) {
		if (client.verbose) console.log(`${info}Interaction Message deleted!`);

		const messageInteraction = interaction.message.interaction;
		const message = interaction.message;

		if (
			messageInteraction != undefined &&
			interaction.user.id != messageInteraction.user.id &&
			!(interaction.member.permissions as PermissionsBitField).has(
				PermissionFlagsBits.ManageMessages,
			)
		)
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().error.permission.notice)
						.setDescription(
							interaction
								.strings()
								.error.permission.user_locked.replace(
									"%USER%",
									`<@!${messageInteraction.user.id}>`,
								),
						)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

		let fetchedRef = false;
		try {
			fetchedRef = (await message.fetchReference()).author.id != interaction.user.id;
		} catch {} // ref deleted or author not matching

		if (
			message.reference !== undefined &&
			fetchedRef &&
			!(interaction.member.permissions as PermissionsBitField).has(
				PermissionFlagsBits.ManageMessages,
			)
		)
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setTitle(interaction.strings().error.permission.notice)
						.setDescription(
							interaction
								.strings()
								.error.permission.user_locked.replace(
									"%USER%",
									`<@!${(await message.fetchReference()).author.id}>`,
								),
						)
						.setColor(colors.red),
				],
				ephemeral: true,
			});

		try {
			return message.delete();
		} catch (err) {
			return interaction.reply({
				content: interaction.strings().error.message.deleted,
				ephemeral: true,
			});
		}
	},
} as Component;
