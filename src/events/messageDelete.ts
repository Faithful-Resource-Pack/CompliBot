import { Event } from "@interfaces";
import { Client, Message, MessageEmbed } from "@client";
import { TextChannel } from "discord.js";
import { colors } from "@helpers/colors";
import { getTeamsIds } from "@helpers/teams";
import { getSubmissionsChannels } from "@helpers/channels";

export const event: Event = {
	name: "messageDelete",
	run: async (client: Client, message: Message) => {
		//! do not remove, 'force' message to be casted (break if removed)
		let _ = (message as Message) instanceof Message;

		let m = Object.assign({}, message); // loose reference to message: create unique instance of the message for the logger (ask @Juknum)
		m.isDeleted = true;
		m.author = message.author; // because we loose methods attached to the object :3
		client.storeAction("message", m);

		/**
		 *! WARNING : old messages aren't cached in the client memory, so we need to fetch them first
		 * - con: we can't fetch the message here because when the 'messageDelete' event is triggered, the message is already deleted (-> Message Not Found error)
		 * - tip: old message should be fetched prior to the 'messageDelete' event trigger
		 * >> before this line: @see https://github.com/discordjs/discord.js/blob/stable/src/client/actions/MessageDelete.js#L17
		 * TODO: add a way to fetch old messages before the 'messageDelete' event trigger (adding a beforeDeleteMessage event ? overriding the 'messageDelete' event ?)
		 */
		if (!message.author || (message.author && message.author.bot)) return;

		if ((client.tokens.dev || getTeamsIds({ name: "faithful" }).includes(message.guild.id)) && !getSubmissionsChannels(client).includes(message.channelId)) {
			const embed = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag} deleted a message` })
				.setColor(colors.red)
				.setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
				.addFields([
					{ name: "Server", value: message.guild.name, inline: true },
					{ name: "Channel", value: `<#${message.channel.id}>`, inline: true },
					{ name: "Message Content", value: `\`\`\`${message.content.replaceAll("```", "'''")}\`\`\`` }
				])
				.setDescription(`[Jump to location](${message.url})\n`)
				.setTimestamp();

			const logChannelId = client.tokens.dev 
				? client.config.discords.filter(d => d.name === "dev")[0].channels.moderation
				: client.config.teams.filter(t => t.name === "faithful")[0].channels.logs;

			const logChannel = client.channels.cache.get(logChannelId) as TextChannel;
			await logChannel.send({ embeds: [embed] });
		}
	},
};
