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
export async function devLogger(client: Client, description: string, params: LogParams = {}) {
	const channel = client.channels.cache.get(client.tokens.errorChannel) as TextChannel;
	if (!channel) return; // avoid infinite loop when crash is outside of client

	// empty strings still enable codeblocks, just no highlighting
	if (params.codeBlocks != null) description = `\`\`\`${params.codeBlocks}\n${description}\`\`\``;

	const embed = new EmbedBuilder()
		.setTitle(params.title ?? "Unhandled Rejection")
		.setDescription(description)
		.setColor(params.color ?? colors.red)
		.setTimestamp();

	await channel.send({ embeds: [embed] }).catch(console.error);
	// send after if provided
	if (params.file) await channel.send({ files: [params.file] }).catch(console.error);
}
