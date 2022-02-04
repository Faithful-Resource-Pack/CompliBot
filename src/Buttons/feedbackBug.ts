import Client from "@src/Client";
import MessageEmbed from "@src/Client/embed";
import Message from "@src/Client/message";
import { ButtonInteraction } from "@src/Client/interaction";
import { Button } from "@src/Interfaces/buttonEvent";
import { MessageInteraction } from "discord.js";

export const button: Button = {
	buttonId: "feedbackBug",
	execute: async (client: Client, interaction: ButtonInteraction) => {
		const messageInteraction: MessageInteraction = interaction.message.interaction as MessageInteraction;
		const message: Message = interaction.message as Message;

		if (interaction.user.id !== messageInteraction.user.id)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Interaction.Reserved" })).replace("%USER%", `<@!${messageInteraction.user.id}>`),
				ephemeral: true,
			});

		const channelFeedback = client.channels.cache.get(client.config.channels[interaction.customId]);

		if (!channelFeedback)
			return interaction.reply({
				content: (await interaction.text({ string: "Error.Channel.CacheNotFound" })).replace("%CHANNEL_NAME%", "#feedback"),
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
		const quotes: Array<string> = (await interaction.text({ string: "Command.Feedback.Bug.Responses", placeholders: { IGNORE_MISSING: "True" } })).split("$,")
		const quote: string = quotes[Math.floor(Math.random() * quotes.length)]

		const embedFeedback = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle(`[${await (await interaction.text({ string: "Command.Feedback.Suggestion" })).toUpperCase()}] ${await interaction.text({ string: "Command.Feedback.Title" })}`)
			.setDescription(`[Jump to message](${url})\n` + "```" + message.embeds[0].description + "```" + `\n_${quote}_`)
			.setFooter({ text: `${interaction.guild.name}` })
			.setTimestamp()
			.setColor("RED");

		channelFeedback.send({ embeds: [embedFeedback] });

		try {
			message.delete();
		} catch (_err) {
			/* message already deleted */
		}
	},
};
