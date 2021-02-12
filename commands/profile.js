const prefix = process.env.PREFIX;
const fs     = require('fs');

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const settings     = require('../settings.js');
const colors       = require('../res/colors.js');
const strings      = require('../res/strings.js');
const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'profile',
	aliases: ['p'],
	uses: 'Anyone',
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what CompliBot know about you`,
	description: 'Add personal information for the Compliance Website Gallery',
	async execute(client, message, args) {

		var profiles = JSON.parse(fs.readFileSync('./json/profiles.json'));
		var index = -1;
		var username = '';

		for (var i = 0; i < profiles.length; i++) {
			if (profiles[i].id == message.author.id) {
				index = i;
				break;
			}
		}

		for (var i = 1; i < args.length; i++) {
			if (i != args.length-1) username += `${args[i]} `;
			else username += args[i];
		}

		if (index != -1) {
			if (args[0] == 'show') showProfile(profiles[index].username, profiles[index].uuid, profiles[index].type);
			else if (args[0] == 'username') profiles[index].username = username;
			else if (args[0] == 'uuid') profiles[index].uuid = args[1];

			else return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);
		} 
		else {
			if (args[0] == 'show') {
				profiles.push({
					username: null,
					uuid: null,
					id: message.author.id,
					type: 'member'
				})

				showProfile();
			}
			else if (args[0] == 'username') {
				profiles.push({
					username: username,
					uuid: null,
					id: message.author.id,
					type: 'member'
				});
			}
			else if (args[0] == 'uuid') {
				profiles.push({
					username: null,
					uuid: args[1],
					id: message.author.id,
					type: 'member'
				});
			}
			else return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN);
		}

		fs.writeFileSync('./json/profiles.json', JSON.stringify(profiles, null, 2));
		return await message.react('✅');

		function showProfile(username = 'None', uuid = 'None', type = 'member') {
			if (username == null) username = 'None';
			if (uuid == null) uuid = 'None';

			var embed = new Discord.MessageEmbed()
				.setAuthor(message.author.tag, message.author.avatarURL())
				.addFields(
					{ name: 'Website Username', value: username          },
					{ name: 'Minecraft UUID',   value: uuid              },
					{ name: 'Discord ID',       value: message.author.id },
					{ name: 'Type',             value: type              }
				)
				.setColor(colors.BLUE)
				.setFooter('CompliBot', settings.BOT_IMG);

			return message.channel.send(embed);
		}
	}
}