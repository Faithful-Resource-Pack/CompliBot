import { Client, EmbedBuilder } from "@client";
import { AttachmentBuilder, ColorResolvable, TextChannel } from "discord.js";
import { colors } from "@utility/colors";
import chalk from "chalk";

export const err = `[${chalk.red("ERR")}] `;
export const info = `[${chalk.blue("INFO")}] `;
export const success = `[${chalk.green("SUCCESS")}] `;
export const warning = `[${chalk.yellow("WARNING")}] `;

export interface LogParams {
	color?: ColorResolvable;
	title?: string;
	file?: AttachmentBuilder;
	codeBlocks?: string;
}

/**
 * Log dev errors and information to a dedicated channel
 * @author Evorp
 * @param client
 * @param description what to log
 * @param params optional config
 */
export async function devLogger(
	client: Client,
	description: string,
	{ color, title, file, codeBlocks }: LogParams = {},
) {
	const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
	if (!channel) return; // avoid infinite loop when crash is outside of client

	// empty strings still enable codeblocks, just no highlighting
	if (codeBlocks != null) description = `\`\`\`${codeBlocks}\n${description}\`\`\``;

	const embed = new EmbedBuilder()
		.setTitle(title || "Unhandled Rejection")
		.setDescription(description)
		.setColor(color || colors.red)
		.setTimestamp();

	await channel.send({ embeds: [embed] }).catch(console.error);
	// send after if provided
	if (file) await channel.send({ files: [file] }).catch(console.error);
}
