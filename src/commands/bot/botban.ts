import { SlashCommand, SlashCommandI } from "@interfaces";
import { Client, EmbedBuilder, ChatInputCommandInteraction } from "@client";
import { Collection, AttachmentBuilder, SlashCommandBuilder } from "discord.js";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { PermissionFlagsBits } from "discord-api-types/v10";

export const command: SlashCommand = {
	data: new SlashCommandBuilder()
		.setName("botban")
		.setDescription("Manages the ban list (devs naughty list :D).")
		.addSubcommand((view) =>
			view
				.setName("view")
				.setDescription("View the ban list")
				.addStringOption((option) =>
					option
						.setName("format")
						.setDescription("The format the ban list should be displayed in.")
						.setRequired(false)
						.addChoices(
							{ name: "Json", value: "json" },
							{ name: "Embed", value: "emb" },
							{ name: "Text", value: "txt" },
							{ name: "Mentions", value: "ment" },
						),
				),
		)
		.addSubcommand((audit) =>
			audit
				.setName("audit")
				.setDescription("change the banlist")
				.addUserOption((option) =>
					option
						.setName("subject")
						.setDescription("The user to edit the permissions of.")
						.setRequired(true),
				)
				.addBooleanOption((option) =>
					option
						.setName("pardon")
						.setDescription("Whether to undo an oopsie or not.")
						.setRequired(false),
				),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	execute: new Collection<string, SlashCommandI>()
		.set("audit", async (interaction: ChatInputCommandInteraction) => {
			if (!interaction.hasPermission("dev")) return;

			await interaction.deferReply({ ephemeral: true });
			const banlist = require("@json/botbans.json");
			// const banlist = JSON.parse(banlistJSON);
			const victimID = interaction.options.getUser("subject").id;
			if (
				(interaction.client as Client).tokens.developers.includes(victimID) ||
				victimID == interaction.client.user.id // self
			)
				return interaction.followUp(interaction.strings().Command.Botban.view.unbannable);

			if (interaction.options.getBoolean("pardon")) {
				banlist.ids.filter(async (v: string) => {
					return v != victimID; // removes only the id of the victim
				});
			} else {
				banlist.ids.push(victimID);
			}
			writeFileSync(join(__dirname, "../../../json/botbans.json"), JSON.stringify(banlist));

			interaction.followUp({
				content: `Bot-${
					interaction.options.getBoolean("revoke") ? "Unbanned" : "Banned"
				} <@${victimID}>`,
				ephemeral: true,
			});
		})
		.set("view", async (interaction: ChatInputCommandInteraction) => {
			if (!interaction.hasPermission("dev")) return;

			await interaction.deferReply({ ephemeral: true });
			const buffer = readFileSync(join(__dirname, "../../../json/botbans.json"));
			const txtBuff = Buffer.from(
				`Botbanned IDs:\n\n${JSON.parse(buffer.toString("utf-8"))["ids"].join("\n")}`,
				"utf-8",
			);

			switch (interaction.options.getString("format")) {
				case "json":
					return interaction.followUp({
						files: [new AttachmentBuilder(buffer, { name: "bans.json" })],
						ephemeral: true,
					});
				case "emb":
					const emb = new EmbedBuilder()
						.setTitle("Botbanned IDs:")
						.setDescription(JSON.parse(buffer.toString("utf-8"))["ids"].join("\n"));
					return interaction.followUp({ embeds: [emb], ephemeral: true });
				case "ment":
					const pingEmb = new EmbedBuilder()
						.setTitle("Botbanned Users:")
						.setDescription("<@" + JSON.parse(buffer.toString("utf-8"))["ids"].join(">\n<@") + ">");
					return interaction.followUp({ embeds: [pingEmb], ephemeral: true });
				case "txt":
				default:
					interaction.followUp({
						files: [new AttachmentBuilder(txtBuff, { name: "bans.txt" })],
						ephemeral: true,
					});
					break;
			}
		}),
};
