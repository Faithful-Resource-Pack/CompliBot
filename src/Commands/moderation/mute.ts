import { GuildMember, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { Command } from '../../Interfaces';

export const command: Command = {
	name: 'mute',
	description: 'mutes a user',
	usage: ['mute <@user> <time> <reason>'],
	aliases: ['timeout'],
	run: async (client, message, args) => {
		if ((await message.guild.members.fetch(message.author)).permissions.has('MUTE_MEMBERS')) return 'You dont have the `MUTE_MEMBERS` permission.';
		if (args.length < 3) return 'You must have at least three arguments';

		let userID: string = undefined;

		try {
			let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
			userID = member.id;
		} catch (err) {
			//userID = args[0].replace('<!@', '').replace('<@', '').replace('>', '')
			//refactored the monster to a regex lol
			let userID = args[0].replace(/(<!@)|(<@)|(>)/g, '');
		}

		//TODO: make the timeout

		let user = await message.guild.members.fetch(userID);
	},
};
