import MessageEmbed from "@src/Client/embed";
import { Command } from "@src/Interfaces";
import { getMember } from "@src/Functions/getMember";
import { Permissions } from "discord.js";

export const command: Command = {
	name: "unmute",
	description: "not implemented yet",
	usage: ["unmute <user> [reason]"],
	run: async (client, message, args) => {
		if (!message.member.permissions.has([Permissions.FLAGS.KICK_MEMBERS])) return message.warn("You don't have permission to do that!");

		if (!args.length) return message.warn("No args given");

		const memberId = await getMember(message, args[0]);
		if (memberId == undefined) return message.warn("I couldn't find anyone to unmute!");

		const reason = !args[1] ? "Not specified" : args.slice(1).join(" ");

		const member = await message.guild.members.fetch(memberId);

		await member.timeout(null, reason);

		var embed = new MessageEmbed().setDescription(`**Unmuted <@${memberId}>**`).addField("Reason", reason);

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
