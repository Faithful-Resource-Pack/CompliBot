const prefix = process.env.PREFIX;
const fs     = require('fs');

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const settings         = require('../settings.js');
const colors           = require('../res/colors.js');
const strings          = require('../res/strings');
const { warnUser }     = require('../functions/warnUser.js');
const { jsonProfiles } = require('../helpers/fileHandler.js');

const NO_PROFILE_FOUND = -1

module.exports = {
	name: 'profile',
	aliases: ['p'],
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what CompliBot know about you`,
	description: strings.HELP_DESC_PROFILE,
	guildOnly: false,
	async execute(client, message, args) {
		const subcommand = (args[0] || '').trim().toLowerCase()
		if(subcommand !== 'username' && subcommand !== 'uuid' && subcommand !== 'show')
			return await warnUser(message, 'Incorrect subcommand, expected username, uuid or show')

		// load profiles and lock
		const profiles = await jsonProfiles.read()

		try {
			let authorProfileIndex = NO_PROFILE_FOUND
			let i = 0

			// search message author profile
			while(i < profiles.length && authorProfileIndex == NO_PROFILE_FOUND) {
				if(profiles[i].id === message.author.id)
					authorProfileIndex = i
				++i
			}

			// if not found, add an empty one
			if(authorProfileIndex == NO_PROFILE_FOUND) {
				profiles.push({
					username: null,
					uuid: null,
					id: message.author.id,
					type: 'member'
				})
			}

			if(subcommand === 'show') {
				showProfile(profiles[index].username, profiles[index].uuid, profiles[index].type)
			}
			else {
				// determine value
				let value = ''
				for(i = 1; i < args.length; ++i) {
					value += `${ args[i] } `
				}
				value = value.trim()
				
				if(subcommand === 'username') {
					profiles[authorProfileIndex].username = value
				}
				else { // else its UUID
					profiles[authorProfileIndex].uuid = value
				}
			}

			// write and release
			await jsonProfiles.write(profiles)

			// react
			return await message.react('✅')
		} catch(error) {
			jsonProfiles.release()
			console.error(error)
			return await warnUser(message, error.toString())
		}
	}
}

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