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
				content: `This interaction is reserved to its owner (<@!${messageInteraction.user.id}>)`,
				ephemeral: true,
			});

		const channelFeedback = client.channels.cache.get(client.config.channels[interaction.customId]);

		if (!channelFeedback)
			return interaction.reply({
				content: "The feedback channel cannot be found in cache!",
				ephemeral: true,
			});

		if (!channelFeedback.isText())
			return interaction.reply({
				content: "The found channel is not a text channel, the feedback cannot be sent!",
				ephemeral: true,
			});

		const embedResponse = new MessageEmbed()
			.setTitle(await interaction.text({ string: "Command.Feedback.Sent" }))
			.setDescription(await message.embeds[0].description)
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTimestamp();

		const reply: Message = (await interaction.reply({ embeds: [embedResponse], fetchReply: true })) as Message;
		const url: string = reply.url;
		const quote: string = bug[Math.floor(Math.random() * bug.length)];

		const embedFeedback = new MessageEmbed()
			.setAuthor({ name: interaction.user.tag, iconURL: interaction.user.avatarURL() })
			.setTitle(`[BUG] Feedback`)
			.setDescription(`[Jump to message](${url})\n` + "```" + message.embeds[0].description + "```" + `\n_${quote}_`)
			.setColor("RED")
			.setFooter({ text: `In ${interaction.guild.name}` })
			.setTimestamp();

		channelFeedback.send({ embeds: [embedFeedback] });

		try {
			message.delete();
		} catch (_err) {
			/* message already deleted */
		}
	},
};

const bug = [
	"God i hate being a developer",
	"I thought i fixed this yesterday",
	"AAAAAAAAAA",
	"Shit.",
	"slap a //todo fix plz in there.",
	"Rule #69: Always blame Juknum",
	"Major skill issue",
];
