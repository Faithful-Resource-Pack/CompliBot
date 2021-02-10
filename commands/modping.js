const prefix = process.env.PREFIX;

const mods = process.env.MODS.split(","); // moderator list

var mods_dnd     = new Array();
var mods_online  = new Array();
var embed        = null;

const Discord = require("discord.js");
const settings = require('../settings.js');

module.exports = {
	name: 'modping',
	aliases: ['moderators', 'pingmods'],
	description: 'Tag online mods to invoke help!',
	uses: 'Anyone',
	syntax: `${prefix}modping`,
	async execute(client, message, args) {
    if (!message.guild) return;

		// void old list :
		mods_dnd = [];
		mods_online = [];

		var MODERATOR_ID = '747839021421428776'; // God id on Robert discord server test

		if (message.guild.id == settings.CDUNGEONS_ID) MODERATOR_ID = settings.CDUNGEONS__MODERATORS_ID;
		if (message.guild.id == settings.CMODS_ID)     MODERATOR_ID = settings.CMODS_MODERATORS_ID;
		if (message.guild.id == settings.CTWEAKS_ID)   MODERATOR_ID = settings.CTWEAKS_MODERATORS_ID;
		if (message.guild.id == settings.CADDONS_ID)   MODERATOR_ID = settings.CADDONS_MODERATORS_ID;
		if (message.guild.id == settings.C32_ID)       MODERATOR_ID = settings.C32_MODERATORS_ID;
		if (message.guild.id == settings.C64_ID)       MODERATOR_ID = settings.C64_MODERATORS_ID;

		if (args == 'urgent') {
			embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
				.setTitle('Moderators:')
				.setDescription('You demanded that all moderators be present. You must have a good reason or penalties may be taken.')
				.setColor('#22202C');

			message.channel.send(embed);
			message.channel.send('<@&' + MODERATOR_ID  + '>');
		}
		else {
			for(i in mods){
				if (message.guild.member(mods[i])) {
					if (message.guild.members.cache.get(mods[i]).presence.status == 'dnd' || message.guild.members.cache.get(mods[i]).presence.status == 'idle') mods_dnd.push(mods[i]);
					if (message.guild.members.cache.get(mods[i]).presence.status == 'online')	mods_online.push(mods[i]);
				}
			}

			var text = '';
			var content = '';

			if (mods_online.length != 0){
				// We have 1 or more mods online
				if (mods_online.length == 1) content = 'There is **' + mods_online.length + ' Mod online**';
				else content = 'There are **' + mods_online.length + ' Mods online**';

				embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setTitle('Moderators:')
					.setDescription(content + '\n> use `/modping` to call mods for help!')
					.setColor('#22202C');

				message.channel.send(embed);

				for (var i in mods_online) text += '<@' + mods_online[i] + '> ';
				message.channel.send(text);

			} else if (mods_dnd.length != 0) {
				// We have 1 or more mods dnd
				if (mods_dnd.length == 1) content = 'There is **' + mods_dnd.length + ' Mod in do not disturb / AFK**, he may not respond.';
				else content = 'There are **' + mods_dnd.length + ' Mods in do not disturb / AFKs**, they may not respond.';

				embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setTitle('Moderators:')
					.setDescription(content + '\n> use `/modping` to call mods for help!')
					.setColor('#22202C');

				message.channel.send(embed);

				for (var i in mods_dnd) text += '<@' + mods_dnd[i] + '> ';
				message.channel.send(text);

			} else {
				// No mods are online
				embed = new Discord.MessageEmbed()
          .setAuthor(message.author.tag, message.author.displayAvatarURL())
					.setTitle('Moderators:')
					.setDescription('There are currently no mods online ¯\\_(ツ)_/¯, I\'m going to ping them all\n> use `/modping` to call mods for help!')
					.setColor('#22202C');

				message.channel.send(embed);
				message.channel.send('<@&' + MODERATOR_ID  + '>');
			}

		}
	}
};
