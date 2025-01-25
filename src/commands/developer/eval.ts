import type { SlashCommand } from "@interfaces/interactions";
import { SlashCommandBuilder, PermissionFlagsBits, MessageFlags } from "discord.js";
import { Client, EmbedBuilder } from "@client";

export const command: SlashCommand = {
	servers: ["dev"],
	data: new SlashCommandBuilder()
		.setName("eval")
		.setDescription("Evaluates a string of code.")
		.addStringOption((option) =>
			option.setName("code").setDescription("The code to evaluate.").setRequired(true),
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDMPermission(false),
	async execute(interaction) {
		if (!interaction.hasPermission("dev")) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const clean = async (text: any, client: Client): Promise<string> => {
			if (text && text.constructor.name === "Promise") text = await text;
			if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });

			return text
				.replaceAll(client.tokens.token, "[BOT_TOKEN]")
				.replaceAll(client.tokens.apiToken, "[API_TOKEN]")
				.replaceAll(client.tokens.gitToken, "[GIT_TOKEN]")
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));
		};
		/**
		 * VARIABLES USED IN eval()
		 */

		const { client, channel, guild } = interaction;

		// ----

		const code = interaction.options.getString("code", true);
		let evaluated: any;
		try {
			evaluated = await eval(
				`(async () => { try { return await (async () => {${
					code.includes("return") ? code : `return ${code}`
				}})() } catch (e) { return e } })()`,
			);
		} catch (e) {
			evaluated = e;
		}

		interaction.editReply({
			embeds: [
				new EmbedBuilder().setDescription(
					`\`\`\`js\n${(await clean(evaluated, interaction.client)).slice(0, 4085)}\`\`\``,
				),
			],
		});
	},
};
