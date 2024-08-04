import { ModalSubmitInteraction } from "discord.js";
import { EmbedBuilder } from "@client";
import { colors } from "@utility/colors";

// ESM workaround
const NewOctokit = (...params: any[]) =>
	import("@octokit/rest").then(({ Octokit }) => new Octokit(...params));

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
		const octokit = await NewOctokit({
			auth: interaction.client.tokens.gitToken,
		});

		octokit.issues.create({
			owner: "Faithful-Resource-Pack",
			repo: "CompliBot",
			title,
			body: `*Issue originally created by \`${interaction.user.displayName}\` on Discord*\n\n${description}`,
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
