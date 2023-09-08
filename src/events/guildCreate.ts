import { Guild, MessageEmbed } from "discord.js";
import { Event } from "@interfaces";
import { info } from "@helpers/logger";

export const event: Event = {
	name: "guildCreate",
	run: async (client, guild: Guild) => {
		client.storeAction("guildJoined", guild);

		client.loadSlashCommands();

		const embed = new MessageEmbed()
			.setTitle("Thanks for Inviting me")
			.setDescription("To get started, try to type `/` to see all available slash commands!");

		guild.systemChannel?.send({ embeds: [embed] });
		console.log(`${info}I was added to a guild. Now I'm in ${client.guilds.cache.size} total!`);
	},
};
