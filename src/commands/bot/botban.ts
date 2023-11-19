import { SlashCommand, SlashCommandI } from "@interfaces/commands";
import { EmbedBuilder, ChatInputCommandInteraction } from "@client";
import {
	Collection,
	AttachmentBuilder,
	SlashCommandBuilder,
	PermissionFlagsBits,
} from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { colors } from "@utility/colors";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("botban")
		.setDescription("Manage the ban list (devs naughty list :D).")
		.addSubcommand((view) =>
			view
				.setName("view")
				.setDescription("View the botban list")
				.addStringOption((option) =>
					option
						.setName("format")
						.setDescription("The format the ban list should be displayed in (default is text).")
						.setRequired(false)
						.addChoices(
							{ name: "JSON", value: "json" },
							{ name: "Embed", value: "embed" },
							{ name: "Text", value: "text" },
							{ name: "Mentions", value: "mentions" },
						),
				),
		)
		.addSubcommand((edit) =>
			edit
				.setName("edit")
				.setDescription("Change the banlist")
				.addUserOption((option) =>
					option
						.setName("subject")
						.setDescription("The user to edit the permissions of.")
						.setRequired(true),
				)
				.addStringOption((option) =>
					option
						.setName("action")
						.setDescription("What to do with this user")
						.addChoices({ name: "Add", value: "add" }, { name: "Remove", value: "remove" })
						.setRequired(true),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
		.setDMPermission(false),
	execute: new Collection<string, SlashCommandI>()
		.set("edit", async (interaction: ChatInputCommandInteraction) => {
			const isAdding = interaction.options.getString("action", true) == "add";

			await interaction.deferReply({ ephemeral: true });
			const banlist = require("@json/botbans.json");
			const victim = interaction.options.getUser("subject");
			const member = await interaction.guild.members.fetch(victim.id);

			if (
				interaction.client.tokens.developers.includes(victim.id) ||
				member.permissions.has(PermissionFlagsBits.ManageMessages) ||
				victim.id == interaction.client.user.id // self
			)
				return interaction.editReply({
					embeds: [
						new EmbedBuilder()
							.setTitle(interaction.strings().command.botban.unbannable.title)
							.setDescription(interaction.strings().command.botban.unbannable.description)
							.setColor(colors.red),
					],
				});

			writeFileSync(
				join(process.cwd(), "json", "botbans.json"),
				JSON.stringify(
					isAdding
						? banlist.ids.concat([victim.id])
						: banlist.ids.filter((v: string) => v != victim.id),
				),
			);

			interaction.editReply({
				embeds: [
					new EmbedBuilder().setDescription(
						`<@${victim.id}> has been ${isAdding ? "botbanned" : "un-botbanned"}.`,
					),
				],
			});
		})
		.set("view", async (interaction: ChatInputCommandInteraction) => {
			if (!interaction.hasPermission("dev")) return;

			await interaction.deferReply({ ephemeral: true });
			const buffer = readFileSync(join(process.cwd(), "json", "botbans.json"));
			const txtBuff = Buffer.from(
				`Botbanned IDs:\n\n${JSON.parse(buffer.toString("utf-8"))["ids"].join("\n")}`,
				"utf-8",
			);

			switch (interaction.options.getString("format")) {
				case "json":
					return interaction.editReply({
						files: [new AttachmentBuilder(buffer, { name: "bans.json" })],
					});
				case "embed":
					const embed = new EmbedBuilder()
						.setTitle("Botbanned IDs:")
						.setDescription(JSON.parse(buffer.toString("utf-8"))["ids"].join("\n"));
					return interaction.editReply({ embeds: [embed] });
				case "mentions":
					const pingEmbed = new EmbedBuilder()
						.setTitle("Botbanned Users:")
						.setDescription("<@" + JSON.parse(buffer.toString("utf-8"))["ids"].join(">\n<@") + ">");
					return interaction.editReply({ embeds: [pingEmbed] });
				default: // also text
					interaction.editReply({
						files: [new AttachmentBuilder(txtBuff, { name: "bans.txt" })],
					});
			}
		}),
};
