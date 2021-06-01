const prefix = process.env.PREFIX;

const Discord   = require("discord.js");
const client    = new Discord.Client();
client.commands = new Discord.Collection();

const settings = require('../../ressources/settings');
const colors   = require('../../ressources/colors');
const strings  = require('../../ressources/strings');

const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'profile',
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what the bot knows about you\n\nModerators only:\n${prefix}profile <@someone>`,
	description: strings.HELP_DESC_PROFILE,
	guildOnly: false,
	/**
	 * @param {Discord.Client} _client Discord client handling command
	 * @param {Discord.Message} message Discord origin message
	 * @param {String[]} args Command arguments
	 */
	async execute(_client, message, args) {
		// get users location
		const usersCollection = require('../../helpers/firestorm/users')

		/** @type {import('../../helpers/firestorm/users').User} */
		let user = await usersCollection.get(message.author.id).catch(err => console.error(err))
		// create empty user
		if (!user) user = new Object()
		if (!args.length) return showProfile(message, user)

		// what we want
		if (args[0].startsWith('<@') && message.member.hasPermission('ADMINISTRATOR')) {

			let userID = args[0].replace('<@', '').replace('>', '').replace('!', '')

			try {
				user = await usersCollection.get(userID)
			}
			catch (err) {
				user = {}
			}

			return showProfile(message, user, userID)
		}
		else if (args[0].startsWith('<@') && !message.member.hasPermission('ADMINISTRATOR'))
			return warnUser(message, strings.COMMAND_NO_PERMISSION)
		else if (args[0] !== 'username' && args[0] !== 'uuid' && args[0] !== 'show')
			return warnUser(message, strings.COMMAND_WRONG_ARGUMENTS_GIVEN)

		if (args[0] === 'show')
			return showProfile(message, user)
		
		// value is the rest of arguments concatenated
		const argumentsLeft = args.slice(1).join(' ')

		// else it is username or uuid so we can trust subcommand
		user[args[0]] = argumentsLeft

		let writeResult = await usersCollection.set(message.author.id, user).catch(err => console.error(err))
		
		return await message.react(writeResult ? '✅' : '❌')
	}
}

async function showProfile(message, user = undefined, memberID = 'None') {
	let username  = user.username ? user.username : 'None'
	let uuid      = user.uuid == null ? 'None' : user.uuid
	let	type      = (user.type && Array.isArray(user.type) && user.type.length > 0) ? user.type.join(', ') + '' : 'member'
	let warns     = (user.warns && Array.isArray(user.warns) && user.warns.length > 0) ? user.warns.map(el => '- ' + el) + '' : 'None'
	let discordID = user.id ? user.id : memberID
	let discordname

	if (discordID == memberID) {
		try {
			discordname = await message.guild.members.cache.get(memberID)
			discordname = discordname.user.username
		}
		catch (err) { /* Not found error */ }
	}

	var embed = new Discord.MessageEmbed()
		.setAuthor(message.author.tag, message.author.avatarURL())
		.setTitle(`${discordname ? discordname : username}'s profile`)
		.addFields(
			{ name: 'Website Username', value: username  },
			{ name: 'Minecraft UUID',   value: uuid      },
			{ name: 'Discord ID',       value: discordID },
			{ name: 'Type',             value: type      },
			{ name: `Warns ${warns == 'None' ? '' : '(' + warns.length + ')'}`, value: warns }
		)
		.setColor(colors.BLUE)
		.setFooter(message.client.user.username, settings.BOT_IMG);

	return message.inlineReply(embed);
}