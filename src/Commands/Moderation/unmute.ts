import MessageEmbed from '~/Client/embed';
import { Command } from '~/Interfaces';
import { getMember } from '~/Functions/getMember';

export const command: Command = {
	name: 'unmute',
	description: 'not implemented yet',
	usage: ['unmute <user> [reason]'],
	run: async (client, message, args) => {
		if (!args.length) return message.warn('No args given');

		const memberId = await getMember(message, args[0]);
		if (memberId == undefined) return message.warn('I couldn\'t find anyone to unmute!');

        const reason = !args[1] ? 'Not specified' : args.slice(1).join(' ');

		const member = await message.guild.members.fetch(memberId);

        await member.timeout(null, reason);
		
		var embed = new MessageEmbed()
			.setDescription(`**Unmuted <@${memberId}>**`)
			.addField('Reason', reason);

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
