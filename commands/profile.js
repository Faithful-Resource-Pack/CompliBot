/* global process */
const prefix = process.env.PREFIX;

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const settings         = require('../settings.js');
const colors           = require('../res/colors.js');
const strings          = require('../res/strings');
const { warnUser }     = require('../functions/warnUser.js');

module.exports = {
	name: 'profile',
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what the bot knows about you`,
	description: strings.HELP_DESC_PROFILE,
	guildOnly: false,
	/**
	 * @param {Discord.Client} _client Discord client handling command
	 * @param {Discord.Message} message Discord origin message
	 * @param {String[]} args Command arguments
	 */
	async execute(_client, message, args) {
		// check first if you have arguments
		if(!args.length)
			return await warnUser(message, 'No arguments, expected username, uuid or show')

		// what we want
		const subcommand = args[0]
		if(subcommand !== 'username' && subcommand !== 'uuid' && subcommand !== 'show')
			return await warnUser(message, 'Incorrect argument, expected username, uuid or show')

		// get users location
		const usersCollection = require('../helpers/firestorm/users')

		/** @type {import('../helpers/firestorm/users').User} */
		let user = await usersCollection.get(message.author.id).catch(err => console.error(err))
		// create empty user
		if(!user)
			user = {}

		if(subcommand === 'show')
			return showProfile(message, user.username, user.uuid, user.type ? user.type.join(', ') : undefined)
		
		// value is the rest of arguments concatenated
		const argumentsLeft = args.slice(1).join(' ')

		// else it is username or uuid so we can trust subcommand
		user[subcommand] = argumentsLeft

		let writeResult = await usersCollection.set(message.author.id, user).catch(err => console.error(err))
		
		return await message.react(writeResult ? '✅' : '❌')
	}
}

function showProfile(message, username = 'None', uuid = 'None', type = 'member') {
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
		.setFooter(message.client.user.username, settings.BOT_IMG);

	return message.inlineReply(embed);
}