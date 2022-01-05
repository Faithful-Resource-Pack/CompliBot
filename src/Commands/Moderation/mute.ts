import MessageEmbed from '~/Client/embed';
import { Command } from '~/Interfaces';
import { getMember } from '~/Functions/getMember';
import { stringToMs } from '~/Functions/time';

export const command: Command = {
	name: 'mute',
    aliases: ['timeout'],
	description: 'not implemented yet',
	usage: ['mute <user> [weapon]'],
	run: async (client, message, args) => {
		if (!args.length) return message.warn('No args given');

		const memberId = await getMember(message, args[0]);
		if (memberId == undefined) return message.warn('I couldn\'t find anyone to mute!');

        if (!args[1]) return message.warn('You didn\'t provide a time!');
        const time = stringToMs(args[1]);

        const reason = !args[2] ? 'Not specified' : args.slice(2).join(' ');

        const member = await message.guild.members.fetch(memberId);

        await member.timeout(time, reason);

		var embed = new MessageEmbed()
            .setDescription(`**Muted <@${memberId}>**`)
			.addFields(
				// time needs to be replaced with something better than args[1]
                { name: 'Time', value: args[1] },
                { name: 'Reason', value: reason}
            );

		const res = await message.reply({ embeds: [embed] });
		res.deleteReact({ authorMessage: message, deleteAuthorMessage: true });
	},
};
