const prefix = process.env.PREFIX;

const settings = require('../../resources/settings.json')
const strings = require('../../resources/strings.json');

const { MessageEmbed } = require('discord.js')
const { warnUser } = require('../../helpers/warnUser');

module.exports = {
	name: 'embed',
	aliases: ['embeds'],
	description: strings.command.description.embed,
	category: 'Developer',
	guildOnly: false,
	uses: strings.command.use.admins,
	syntax: `${prefix}embed <id> <colors> <black/blue/green/red/yellow/crimson>\n\n${prefix}embed <id> <description> <set/add/remove> <value>\n\n${prefix}embed <id> <fields> <modify> <pos> <value>\n${prefix}embed <id> <fields> <add> <title> <value> [inline: true/false]\n${prefix}embed <id> <fields> <remove> <pos>`,
	async execute(client, message, args) {
		if (!message.member.roles.cache.some(role => role.name.includes("Administrator") || role.id === '747839021421428776')) return warnUser(message, strings.command.no_permission)
		if (!args.length) return warnUser(message, strings.command.args.none_given);
		if (isNaN(args[0])) return warnUser(message, 'You have to specify an ID first');

		try {
			await message.channel.messages.fetch(args[0]);
		} catch (e) {
			return warnUser(message, 'ID should be from the same channel');
		}

		var embedMessage = await message.channel.messages.fetch(args[0]);
		var embed = new MessageEmbed();

		embed = embedMessage.embeds[0];

		if (args[1] == 'colors' || args[1] == 'color') {
			if (args[2] == 'black') embed.setColor(settings.colors.black);
			else if (args[2] == 'blue') embed.setColor(settings.colors.blue);
			else if (args[2] == 'green') embed.setColor(settings.colors.green);
			else if (args[2] == 'red') embed.setColor(settings.colors.red);
			else if (args[2] == 'yellow') embed.setColor(settings.colors.yellow);
			else if (args[2] == 'council' || args[2] == 'crimson') embed.setColor(settings.colors.council);
			else return warnUser(message, `You should use black/blue/green/red/yellow/crimson, not ${args[2]}`);
		}

		else if (args[1] == 'description') {
			var description = args[3];
			for (var i = 4; i < args.length; i++)	description += ` ${args[i]}`;
			if (args[2] == 'set' && args[3] != undefined) embed.setDescription(description);
			else if (args[2] == 'add' && args[3] != undefined) embed.setDescription(embed.description + ' ' + description);
			else if (args[2] == 'remove') embed.setDescription('');
			else return warnUser(message, `You should use add/remove/set, not ${args[2]}`);
		}

		else if (args[1] == 'fields' || args[1] == 'field') {
			if (args[2] == 'modify') {
				if (isNaN(args[3]) || args[3] < 0 || args[3] > embedMessage.embeds[0].fields.length) return warnUser(message, 'You have to specify an integer!');
				if (args[4] != undefined) embed.fields[args[3]].value = args[4];
			}
			else if (args[2] == 'add') {
				if (args[3] == undefined) return warnUser(message, 'Title can\'t be empty!');
				if (args[4] == undefined) return warnUser(message, 'Value can\'t be empty!');
				if (args[5] == 'true') embed.addFields({ name: args[3], value: args[4], inline: true });
				else embed.addFields({ name: args[3], value: args[4] });
			}

			else if (args[2] == 'remove') {
				if (args[3] == 'all' || args[3] == 'everything') embed.fields = [];
				else if (isNaN(args[3]) || args[3] < 0 || args[3] > embedMessage.embeds[0].fields.length) return warnUser(message, 'The position must be an integer!');
				else {
					for (let i = 0; i < embedMessage.embeds[0].fields.length; i++) {
						if (i == args[3]) {
							embed.fields.splice(i, 1);
						}
					}
				}
			} else return warnUser(message, `You should use add/remove/modify, not ${args[2]}`);
		} else return warnUser(message, `You should use fields/description/color, not ${args[1]}`);

		await embedMessage.edit({ embeds: [embed] });
		await message.delete();
	}
}