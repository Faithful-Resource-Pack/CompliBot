import { SlashCommand } from "@interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message, MessageEmbed } from "@client";
import { EmbedField } from "discord.js";
import { ids, parseId } from "@helpers/emojis";
import { getRolesIds } from "@helpers/roles";

export const command: SlashCommand = {
	servers: ["faithful", "classic_faithful"],
	permissions: {
		roles: getRolesIds({ name: "council", discords: ["dev"], teams: ["faithful"] }),
	},
	data: new SlashCommandBuilder() // disable the command for @everyone (only council can do it)
		.setName("reason")
		.setDescription("Set reason for submission invalidation/deny!")
		.addStringOption((option) =>
			option.setName("message_id").setDescription("Submission message ID you want to add a reason.").setRequired(true),
		)
		.addStringOption((option) =>
			option.setName("reason").setDescription("Reason of the invalidation/deny.").setRequired(true),
		),
	execute: async (interaction: CommandInteraction) => {
		if (!(await interaction.perms({ type: "council" }))) return;

		let isInvalidated: boolean = false;

		interaction.channel.messages
			.fetch(interaction.options.getString("message_id", true))
			.then(async (message: Message) => {
				const embed: MessageEmbed = message.embeds[0];
				embed.fields.forEach((field: EmbedField) => {
					if (field.name === "Reason") {
						field.value = interaction.options.getString("reason", true);
						isInvalidated = true;
					}
				});

				if (!isInvalidated)
					return interaction.reply({
						content: `The message needs to be first invalidated using the ${parseId(ids.invalid)} button!`,
						ephemeral: true,
					});

				message.edit({ embeds: [embed], files: [...message.attachments.values()] });
				interaction.reply({
					content: await interaction.getEphemeralString({ string: "Success.General" }),
					ephemeral: true,
				});
			})
			.catch((err) => {
				interaction.reply({ content: "Cannot fetch the message with the given message ID", ephemeral: true });
			});
	},
};
