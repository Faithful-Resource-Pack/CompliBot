import { Event } from "@interfaces";
import { Client, Message, MessageEmbed } from "@client";
import { TextChannel } from "discord.js";
import { colors } from "@helpers/colors";

export const event: Event = {
	name: "messageDelete",
	run: async (client: Client, message: Message) => {
		if (message.author.bot) return;

		if (message.guild.id !== "773983706582482946") return;

		var embed = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag} deleted a message`})
			.setColor(colors.red)
			.setThumbnail(message.author.displayAvatarURL())
			.setDescription(`[Jump to location](${message.url})\n\n**Channel**: <#${message.channel.id}>**Content**:\n\`\`\`${message.content}\`\`\``)
			.setTimestamp()

		const logChannel = client.channels.cache.get("959727916881686568") as TextChannel;
		await logChannel.send({ embeds: [embed] });
	},
};
