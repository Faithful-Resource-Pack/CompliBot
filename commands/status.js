const Discord = require('discord.js');
const settings = require('../settings.js');
uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

const activity = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM_STATUS', 'COMPETING'];
const presence = ['online', 'idle', 'dnd'];

module.exports = {
	name: 'status',
  aliases: ['presence', 'activity'],
	description: 'Changes the bot\'s status',
	uses: 'Bot Developers',
	syntax: `${prefix}status <activity> <presence> <status>`,
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {

      if (!args.length) {
				const embed = new Discord.MessageEmbed()
				.setTitle('Status command:')
				.setThumbnail(settings.BOT_IMG)
				.setDescription('``/status <activity> <presence> <status>``\n**Activity**:\nPLAYING, STREAMING, LISTENING, WATCHING, COMPETING, CUSTOM_STATUS (do not work)\n**Presence**:\nonline, idle, dnd')
				.setFooter('CompliBot', settings.BOT_IMG);
				
				const msg = await message.channel.send(embed)
        await message.react('❌');
				await msg.delete({ timeout: 30000 });
			}
      
			if(activity.includes(args[0]) && presence.includes(args[1])) {
				client.user.setPresence(
					{ 
						activity: { 
							name: args.join(" ").replace(args[0],'').replace(args[1], ''), 
							type: args[0], 
							url: 'https://compliancepack.net' 
						}, 
						status: args[1]
					}
				);
			}

    } else {
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};