import { Event } from "@interfaces";
import { Client, Message, MessageEmbed } from "@client";
import { TextChannel } from "discord.js";
import { colors } from "@helpers/colors";

export const event: Event = {
	name: "messageDelete",
	run: async (client: Client, message: Message) => {
		//! do not remove, 'force' message to be casted (break if removed)
		let _ = (message as Message) instanceof Message;

		let m = Object.assign({}, message); // loose reference to message: create unique instance of the message for the logger (ask @Juknum)
		m.isDeleted = true;
		m.author = message.author; // because we loose methods attached to the object :3
		client.storeAction("message", m);

		if (message.author && message.author.bot) return;

		if (message.guild.id == "773983706582482946" || message.guild.id == "614160586032414845") {

			if (message.channel.id == "773987409993793546" || message.channel.id == "931887174977208370") return; // Texture submission channels

			var embed = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag} deleted a message`})
				.setColor(colors.red)
				.setThumbnail(message.author.displayAvatarURL())
				.setDescription(`[Jump to location](${message.url})\n\n**Channel**: <#${message.channel.id}>\n\n**Server**: ${message.guild.name}\n\n**Content**:\n\`\`\`${message.content}${message.attachments.size > 0 ? message.attachments.first().name : ""}\`\`\``)
				.setTimestamp()

			const logChannel = client.channels.cache.get("959727916881686568") as TextChannel;
			await logChannel.send({ embeds: [embed] });
		}
		else return;
	},
};
