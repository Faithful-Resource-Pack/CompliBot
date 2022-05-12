import { SlashCommand } from "@helpers/interfaces";
import { SlashCommandBuilder } from "@discordjs/builders";
import { Client, CommandInteraction, Message, MessageEmbed } from "@client";

export const command: SlashCommand = {
	permissions: {
		users: [
			"207471947662098432", // Juknum
			"173336582265241601", // TheRolf
			"473860522710794250", // RobertR11
			"601501288978448411", // Nick
		],
	},
	servers: ["dev"],
	data: new SlashCommandBuilder()
		.setDefaultPermission(false)
		.setName("eval")
		.setDescription("Evaluates a string of code.")
		.addStringOption((option) => option.setName("code").setDescription("The code to evaluate.").setRequired(true)),
	execute: async (interaction: CommandInteraction) => {
		if (
			await interaction.perms({
				users: ["207471947662098432", "173336582265241601", "601501288978448411", "473860522710794250"],
			})
		)
			return;
		const clean = async (text: any, client: Client): Promise<string> => {
			if (text && text.constructor.name === "Promise") text = await text;
			if (typeof text !== "string") text = require("util").inspect(text, { depth: 1 });

			text = text
				.replaceAll(client.tokens.token, "[BOT_TOKEN]")
				.replaceAll(client.tokens.apiPassword, "[API_PASSWORD]")
				.replaceAll(client.tokens.firestormToken, "[FIRESTORM_TOKEN]")
				.replace(/`/g, "`" + String.fromCharCode(8203))
				.replace(/@/g, "@" + String.fromCharCode(8203));

			return text;
		};
		/**
		 * VARIABLES USED IN eval()
		 */

		const client = interaction.client;
		const channel = interaction.channel;

		// ----

		const code: string = interaction.options.getString("code", true);
		const evaluated = await eval(
			`(async () => { try { return await (async () => {${
				code.includes("return") ? code : `return ${code}`
			}})() } catch (e) { return e } })()`,
		);

		interaction.reply({
			ephemeral: true,
			embeds: [
				new MessageEmbed().setDescription(
					`\`\`\`js\n${(await clean(evaluated, interaction.client as Client)).slice(0, 4085)}\`\`\``,
				),
			],
		});
	},
};
