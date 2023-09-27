import { Guild, EmbedBuilder } from "discord.js";
import { Event } from "@interfaces";
import { info } from "@helpers/logger";

export default {
	name: "guildCreate",
	async run(client, guild: Guild) {
		client.storeAction("guildJoined", guild);

		client.loadSlashCommands();

		const embed = new EmbedBuilder()
			.setTitle("Thanks for Inviting me")
			.setDescription("To get started, try to type `/` to see all available slash commands!");

		guild.systemChannel?.send({ embeds: [embed] });
		console.log(`${info}I was added to a guild. Now I'm in ${client.guilds.cache.size} total!`);
	},
 } as Event;
