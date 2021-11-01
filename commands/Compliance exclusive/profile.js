const prefix = process.env.PREFIX;

const Discord = require("discord.js");

const settings = require('../../resources/settings.json');
const strings = require('../../resources/strings.json');

const { warnUser } = require('../../helpers/warnUser');
const { getMember } = require("../../helpers/getMember");

module.exports = {
	name: 'profile',
	description: strings.command.description.profile,
	category: 'Compliance exclusive',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}profile username <Your Name>\n${prefix}profile uuid <Your MC uuid (full uuid)>\n${prefix}profile show -> Display what the bot knows about you\n\nModerators only:\n${prefix}profile [@someone/username/nickname/id]`,
	/**
	 * @param {Discord.Client} _client Discord client handling command
	 * @param {Discord.Message} message Discord origin message
	 * @param {String[]} args Command arguments
	 */
	async execute(client, message, args) {
		// get users location
		const usersCollection = require('../../helpers/firestorm/users')

		/** @type {import('../../helpers/firestorm/users').User} */
		let user = await usersCollection.get(message.author.id).catch(err => console.error(err))
		// create empty user
		if (!user) user = new Object()
		if (!args.length) return showProfile(message, user)

		if (args[0] !== 'username' && args[0] !== 'uuid' && args[0] !== 'show' && !message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator") || role.id === '747839021421428776'))
			return warnUser(message, strings.command.args.invalid.generic)

		if (args[0] === 'show')
			return showProfile(message, user)

		if (args[0] !== 'username' && args[0] !== 'uuid' && args[0] !== 'show') {
			let MemberID = await getMember(message, args[0])

			try {
				user = await usersCollection.get(MemberID)
			}
			catch (err) {
				user = {}
			}

			return showProfile(message, user, MemberID)
		}

		// value is the rest of arguments concatenated
		const argumentsLeft = args.slice(1).join(' ')

		// else it is username or uuid so we can trust subcommand
		user[args[0]] = argumentsLeft

		let writeResult = await usersCollection.set(message.author.id, user).catch(err => console.error(err))

		return await message.react(writeResult ? '✅' : '❌')
	}
}

async function showProfile(message, user = undefined, memberID = 'None') {
	let username = user.username ? user.username : 'None'
	let uuid = user.uuid == null ? 'None' : user.uuid
	let type = (user.type && Array.isArray(user.type) && user.type.length > 0) ? user.type.join(', ') + '' : 'Member'
	let warns = (user.warns && Array.isArray(user.warns) && user.warns.length > 0) ? user.warns.map(el => '- ' + el).join('\n') + '' : 'None'
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
			{ name: 'Website Username', value: username },
			{ name: 'Minecraft UUID', value: uuid },
			{ name: 'Discord ID', value: discordID },
			{ name: 'Roles', value: type }
		)
		.setColor(settings.colors.blue)
		.setFooter(message.client.user.username, settings.images.bot);

		if (message.guild !== null && message.member.roles.cache.some(role => role.name.includes("Administrator") || role.name.includes("Moderator")))
			embed.addField(`Warns ${warns == 'None' ? '' : '(' + user.warns.length + ')'}`, warns)

	return message.reply({ embeds: [embed] });
}