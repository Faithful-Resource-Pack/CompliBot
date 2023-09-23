import { Client, ButtonInteraction, EmbedBuilder, Message } from "@client";
import settings from "@json/dynamic/settings.json";
import { colors } from "@helpers/colors";

const quotes = {
	suggestion: [
		"Hot take but okay",
		"Sure...",
		"Maybe later...",
		"Why didn't i think of that?",
		"Adding one to the other %NUMBER% things todo",
		"Infeasible idea but tell them you might",
		"Dev bad",
		"soon™",
	],
	bug: [
		"God i hate being a developer",
		"I thought i fixed this yesterday",
		"AAAAAAAAAA",
		"Shit.",
		"Slap a '//todo fix plz' in there.",
		"Rule #69: Always blame Juknum",
		"Major skill issue",
	],
};

export default async function sendFeedback(
	client: Client,
	interaction: ButtonInteraction,
	user: String,
	type: "suggestion" | "bug",
) {
	if (interaction.user.id !== user)
		return interaction.reply({
			content: (
				await interaction.getEphemeralString({ string: "Error.Interaction.Reserved" })
			).replace("%USER%", `<@!${user}>`),
			ephemeral: true,
		});

	const channel = client.channels.cache.get(settings.channels.feedback[type]);

	if (!channel)
		return interaction.reply({
			content: (
				await interaction.getEphemeralString({ string: "Error.Channel.CacheNotFound" })
			).replace("%CHANNEL_NAME%", "#feedback"),
			ephemeral: true,
		});

	if (!channel.isText())
		return interaction.reply({
			content: await interaction.getEphemeralString({ string: "Error.Channel.NotTextChannel" }),
			ephemeral: true,
		});

	const responseEmbed = new EmbedBuilder()
		.setTitle(
			(await interaction.getEphemeralString({ string: "Command.Feedback.Sent" })).replace(
				"%FEEDBACKTYPE%",
				// uppercase
				type.replace(/\b(\w)/gu, (letter) => letter.toUpperCase()),
			),
		)
		.setDescription(interaction.message.embeds[0].description)
		.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
		.setTimestamp();

	const reply: Message = (await (interaction.message as Message).edit({
		embeds: [responseEmbed],
		components: [],
	})) as Message;

	reply.deleteButton();

	const url: string = reply.url;
	const quote: string = quotes[type][Math.floor(Math.random() * quotes[type].length)];

	const developerEmbed = new EmbedBuilder()
		.setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() })
		.setTitle(`[${type.toUpperCase()}] Feedback`)
		.setURL(url)
		.setDescription(`\`\`\`${interaction.message.embeds[0].description}\`\`\`\n_${quote}_`)
		.setFooter({ text: `${interaction.guild.name}` })
		.setTimestamp();

	if (type === "bug") developerEmbed.setColor(colors.red);
	channel.send({ embeds: [developerEmbed] });
}
