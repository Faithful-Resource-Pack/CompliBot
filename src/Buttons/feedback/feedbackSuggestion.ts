import { Client, MessageEmbed, Message, ButtonInteraction } from "@src/Extended Discord";
import { Button } from "@src/Interfaces/buttonEvent";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "feedbackSuggestion",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Interaction.Reserved" })).replace(
					"%USER%",
					`<@!${messageInteraction.user.id}>`,
				),
				ephemeral: true,
			});

		const channelFeedback = client.channels.cache.get(client.config.channels[interaction.customId]);

		if (!channelFeedback)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Channel.CacheNotFound" })).replace(
					"%CHANNEL_NAME%",
					"#feedback",
				),
				ephemeral: true,
			});

		if (!channelFeedback.isText())
			return interaction.reply({
				content: await interaction.text({ string: "Error.Channel.NotTextChannel" }),
				ephemeral: true,
			});

		const embedResponse = new MessageEmbed()
			.setTitle(await interaction.text({ string: "Command.Feedback.Sent" }))
			.setDescription(await message.embeds[0].description)
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTimestamp();

		const reply: Message = (await interaction.reply({ embeds: [embedResponse], fetchReply: true })) as Message;
		const url: string = reply.url;
		const quote: string = Suggestion[Math.floor(Math.random() * Suggestion.length)].replace(
			"%NUMBER%",
			new Date().toString(),
		);

		const embedFeedback = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle(`[SUGGESTION] Feedback`)
			.setDescription(`[Jump to message](${url})\n` + "```" + message.embeds[0].description + "```" + `\n_${quote}_`)
			.setFooter({ text: `${interaction.guild.name}` })
			.setTimestamp();

		channelFeedback.send({ embeds: [embedFeedback] });

		try {
			message.delete();
		} catch (_err) {
			/* message already deleted */
		}
	},
};

const Suggestion = [
	"Hot take but okay",
	"Sure...",
	"Maby later...",
	"Why didnt i think of that?",
	"Adding one to the other %NUMBER% things todo",
	"Infeasable idea but tell them you might",
	"Dev bad",
	"soon:tm:",
];