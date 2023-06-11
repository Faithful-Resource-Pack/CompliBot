const prefix = process.env.PREFIX;

const strings = require('../../resources/strings.json');
const settings = require('../../resources/settings.json')

const { warnUser } = require('../../helpers/warnUser');

const activity = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM_STATUS', 'COMPETING'];
const presence = ['online', 'idle', 'dnd'];

module.exports = {
	name: 'status',
	aliases: ['presence', 'activity'],
	description: strings.command.description.status,
	category: 'Developer',
	guildOnly: false,
	uses: strings.command.use.devs,
	syntax: `${prefix}status <activity> <presence> <status>`,
	async execute(client, message, args) {
		if (process.env.DEVELOPERS.includes(message.author.id)) {

			if (!args.length) return warnUser(message, strings.command.args.none_given);

			if (activity.includes(args[0]) && presence.includes(args[1])) {
				client.user.setPresence({
					activities: [{
						name: args.join(" ").replace(args[0], '').replace(args[1], ''),
						type: args[0]
					}],
					status: args[1]
				});
			}
			await message.react(settings.emojis.upvote);
		} else return warnUser(message, strings.command.no_permission);
	}
};
