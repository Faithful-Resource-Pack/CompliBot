import { SlashCommand } from "@interfaces/commands";
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import { Client, ChatInputCommandInteraction, EmbedBuilder } from "@client";

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
	async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.hasPermission("dev")) return;
		await interaction.deferReply({ ephemeral: true });

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

		const client = interaction.client;
		const channel = interaction.channel;

		// ----

		const code = interaction.options.getString("code", true);
		const evaluated = await eval(
			`(async () => { try { return await (async () => {${
				code.includes("return") ? code : `return ${code}`
			}})() } catch (e) { return e } })()`,
		);

		interaction.editReply({
			embeds: [
				new EmbedBuilder().setDescription(
					`\`\`\`js\n${(await clean(evaluated, interaction.client)).slice(0, 4085)}\`\`\``,
				),
			],
		});
	},
};
