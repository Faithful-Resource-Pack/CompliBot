import { Guild, MessageEmbed } from "discord.js";
import { Event } from "@src/Interfaces";
import { info } from "@src/Helpers/logger";

export const event: Event = {
	name: "guildCreate",
	run: async (client, guild: Guild) => {
		const embed = new MessageEmbed()
			.setTitle("Thanks for Inviting me")
			.setDescription("To get started, try to type `/` to see all available slash commmands!");

		guild.systemChannel?.send({ embeds: [embed] });
		console.log(`${info}I was added to a guild, now im in: ` + client.guilds.cache.size);
	},
};
