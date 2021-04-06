const prefix = process.env.PREFIX;

const strings = require('../../res/strings');
const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

const { warnUser } = require('../../functions/warnUser.js');

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
    if (message.author.id === uidR || message.author.id === uidJ) {

			if (!args.length) return warnUser(message,strings.COMMAND_NO_ARGUMENTS_GIVEN) ;

			if(activity.includes(args[0]) && presence.includes(args[1])) {
				client.user.setPresence({
						activity: {
							name: args.join(" ").replace(args[0],'').replace(args[1], ''),
							type: args[0],
							url: 'compliancepack.net'
						},
						status: args[1]
				});
			}
    } else warnUser(message, strings.COMMAND_NO_PERMISSION);
	}
};
