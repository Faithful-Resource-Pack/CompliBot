import { SlashCommand, SlashCommandI } from "@src/Interfaces/slashCommand";
import { SlashCommandBuilder } from "@discordjs/builders";
import CommandInteraction from "@src/Client/commandInteraction";
import MessageEmbed from "@src/Client/embed";
import Message from "@src/Client/message";
import Client from "@src/Client";
import { ButtonInteraction, Collection, MessageActionRow, MessageButton } from "discord.js";
import { ids, parseId } from "@src/Helpers/emojis";
import ExtendedClient from "@src/Client";

export const command: SlashCommand = {
	permissions: undefined,
	data: new SlashCommandBuilder()
		.setName("feedback")
		.setDescription("Submits bot feedback to the developers.")
		.addStringOption((option) =>
			option.setName("message").setDescription("The message you wish to send").setRequired(true),
		),
	execute: (interaction: CommandInteraction, client: ExtendedClient) => {
		feedback(interaction, client);
	},
};

async function feedback(interaction: CommandInteraction, client: Client) {
	const preview = new MessageEmbed()
		.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
		.setTitle(await interaction.text({ string: "Command.Feedback.Preview" }))
		.setDescription(interaction.options.getString("message"))
		.setTimestamp()
		.setFooter({ text: await interaction.text({ string: "Command.Feedback.ConfirmPrompt" }) });
	const cancel = new MessageButton()
		.setLabel(await interaction.text({ string: "General.Cancel" }))
		.setStyle("SECONDARY")
		.setEmoji(parseId(ids.delete))
		.setCustomId("feedbackCancelSend");
	const Bug = new MessageButton()
		.setLabel(await interaction.text({ string: "Command.Feedback.Bug" }))
		.setStyle("DANGER")
		.setEmoji(parseId(ids.downvote))
		.setCustomId("feedbackBug");
	const Suggestion = new MessageButton()
		.setLabel(await interaction.text({ string: "Command.Feedback.Suggestion" }))
		.setStyle("SUCCESS")
		.setEmoji(parseId(ids.upvote))
		.setCustomId("feedbackSuggestion");
	const buttons = new MessageActionRow().addComponents([cancel, Bug, Suggestion]);

	const previewMsg = (await interaction.reply({
		components: [buttons],
		embeds: [preview],
		fetchReply: true,
	})) as Message;

	const filter = (filteredInteraction: ButtonInteraction) => filteredInteraction.user.id == interaction.user.id;
	const collector = previewMsg.createMessageComponentCollector({ filter: filter, maxUsers: 1, time: 1000 * 60 });

	collector.on("collect", async (collected) => {
		if (collected.customId == "feedbackCancelSend") interaction.deleteReply();

		let type = collected.customId == "feedbackBug" ? "Bug" : "Suggestion";
		console.log(type);
		const sentEmbed = new MessageEmbed()
			.setDescription(interaction.options.getString("message"))
			.setTimestamp()
			.setTitle(await interaction.text({ string: "Command.Feedback.Sent" }))
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() });

		let reply = await collected.reply({ embeds: [sentEmbed], fetchReply: true });
		let url = (reply as Message).url;

		var quote =
			type == "Bug"
				? bug[Math.floor(Math.random() * bug.length)]
				: suggestion[Math.floor(Math.random() * suggestion.length)];

		const feedbackChannel = await client.channels.cache.get(client.config.channels[type]);
		console.log(feedbackChannel);
		if (feedbackChannel.isText()) {
			const sendEmbed = new MessageEmbed()
				.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
				.setDescription(
					`[Jump to message](${url})\n\n` + "```" + interaction.options.getString("message") + "```" + `\n\n_${quote}_`,
				)
				.setTimestamp()
				.setTitle(`Feedback [${type}]`)
				.setColor((type = "Bug" ? "RED" : "BLURPLE"))
				.setFooter({ text: `In ${interaction.guild.name}` });
			feedbackChannel.send({ embeds: [sendEmbed] });
		}
	});

	collector.on("end", async (collected) => interaction.deleteReply());
}
const bug = [
	"God i hate being a developer",
	"I thought i fixed this yesterday",
	"AAAAAAAAAA",
	"Shit.",
	"slap a //todo fix plz in there.",
	"Rule #69: Always blame Juknum",
	"Major skill issue",
];

const suggestion = [
	"Hot take but okay",
	"Sure...",
	'"Maby later..."',
	"Why didnt i think of that?",
	`Adding one to the other ${+new Date()} things todo`, //unix time stamp because funny
	"Infeasable idea but tell them you might",
	"Dev bad",
	"soon:tm:",
];
