const prefix = process.env.PREFIX;

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;
const uidT = process.env.UIDT;

const strings = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser');

const activity = ['PLAYING', 'STREAMING', 'LISTENING', 'WATCHING', 'CUSTOM_STATUS', 'COMPETING'];
const presence = ['online', 'idle', 'dnd'];

module.exports = {
	name: 'status',
	aliases: ['presence', 'activity'],
	description: strings.HELP_DESC_STATUS,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}status <activity> <presence> <status>`,
	async execute(client, message, args) {
    if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

			if (!args.length) return warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

			if(activity.includes(args[0]) && presence.includes(args[1])) {
				client.user.setPresence({
						activities: [{
							name: args.join(" ").replace(args[0],'').replace(args[1], ''),
							type: args[0]
						}],
						status: args[1]
				});
			}
			await message.react('✅');
    } else return warnUser(message, strings.COMMAND_NO_PERMISSION);
	}
};
