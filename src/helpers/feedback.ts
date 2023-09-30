import { ModalSubmitInteraction } from "discord.js";
import { Octokit } from "@octokit/rest";
import { Client, EmbedBuilder } from "@client";
import { colors } from "./colors";

/**
 * Create GitHub issue with specified title and description
 * @author Evorp
 * @param interaction for getting author name and catching errors
 * @param title issue title
 * @param description issue body
 */
export default async function sendFeedback(
	interaction: ModalSubmitInteraction,
	title: string,
	description: string,
) {
	try {
		const octokit = new Octokit({
			auth: (interaction.client as Client).tokens.gitToken,
		});

		octokit.issues.create({
			owner: "Faithful-Resource-Pack",
			repo: "CompliBot",
			title,
			body: `*Issue originally created by \`${interaction.user.username}\` on Discord*\n\n${description}`,
		});
	} catch (err) {
		interaction.followUp({
			embeds: [
				new EmbedBuilder()
					.setTitle("Feedback could not be sent!")
					.setDescription(`Error for the developers: \`\`\`${err}\`\`\``)
					.setColor(colors.red),
			],
		});
	}
}
