import { Event, Command } from "@src/Interfaces";
import { increase } from "@src/Functions/commandProcess";
import { Client, Message } from "@src/Extended Discord";
import { MessageReaction, User } from "discord.js";
// import { Polls } from "@src/Functions/poll";

export const event: Event = {
	name: "messageReactionAdd",
	run: async (client: Client, reaction: MessageReaction, user: User) => {
		if (user.bot) return;
		if (reaction.message.partial) await reaction.message.fetch();

		// /* Poll system */
		// new Polls(client)
		// 	.setGuild(reaction.message.guildId)
		// 	.setChannel(reaction.message.channelId)
		// 	.setMessage(reaction.message.id)
		// 	.addVote(reaction, user); // check if it's a poll, do nothing if not
	},
};
