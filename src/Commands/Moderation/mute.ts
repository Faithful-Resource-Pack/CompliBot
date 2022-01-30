import MessageEmbed from "@src/Client/embed";
import { Command } from "@src/Interfaces";
import { getMember } from "@src/Functions/getMember";
import { stringToMs } from "@src/Functions/time";
import { Permissions } from "discord.js";

export const command: Command = {
	name: "mute",
	aliases: ["timeout"],
	description: "not implemented yet",
	usage: ["mute <user> [time] [reason]"],
	run: async (client, message, args) => {
		if (!message.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) return message.warn("You don't have permission to do that!");

		if (!args.length) return message.warn("No args given");

		const memberId = await getMember(message, args[0]);
		if (memberId == undefined) return message.warn("I couldn't find anyone to mute!");

		if (memberId == message.author.id) return message.warn("You can't mute yourself!");

		if (memberId == client.user.id) return message.warn("I won't mute myself!");

		if (memberId.manageable) return message.warn("I can't mute higher beings.");

		if (!args[1]) return message.warn("You didn't provide a time!");
		const time = stringToMs(args[1]);

		if (time > 1000 * 60 * 60 * 24 * 7 * 4)
			return message.warn("You can't mute someone for longer than 4 weeks! (blame Discord)");

		const reason = !args[2] ? "Not specified" : args.slice(2).join(" ");

		const member = await message.guild.members.fetch(memberId);

		await member.timeout(time, reason);

		var embed = new MessageEmbed().setDescription(`**Muted <@${memberId}>**`).addFields(
			// time needs to be replaced with something better than args[1]
			{ name: "Time", value: args[1] },
			{ name: "Reason", value: reason },
		);

		if (time == 0)
			var embed = new MessageEmbed().setDescription(`**Unmuted <@${memberId}>**`).addField("Reason", reason);

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
