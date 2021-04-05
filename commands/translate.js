const prefix = process.env.PREFIX;

const Discord       = require('discord.js');
const translate = require('@vitalets/google-translate-api');

const strings  = require('../res/strings');
const colors   = require('../res/colors');
const settings = require('../settings.js');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;
const uidD = process.env.UIDD;

const { warnUser } = require('../functions/warnUser.js');

function truncate(string, length) {
	if (string.length <= length) return string
  else return string.substr(0, length - 1) + '\u2026'
}

module.exports = {
	name: 'translate',
	description: strings.HELP_DESC_TRANSLATE,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}translate`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {

			if (args[0].length < 2) return warnUser(message, 'This language doesn\'t exist!');

			const result = await translate(args.slice(1).join(' '), {to: args[0]});

			args.shift()
			const embed = new Discord.MessageEmbed()
				.setAuthor(`${message.author.tag} translated: ${truncate(args.join(' '), 78+message.author.tag.length)}`, message.author.displayAvatarURL())
				.setDescription(`\`\`\`${result.text}\`\`\``)
				.setColor(colors.BLUE)
				.setFooter(`${result.from.language.iso} → ${args[0]}`, settings.BOT_IMG);
				
			const embedMessage = await message.channel.send(embed);

			if (result.text.includes('sus')) {
				if (message.guild.id == settings.C32_ID) await embedMessage.react('814877213857546270');
				if (message.guild.id == '720677267424018526') await embedMessage.react('821052515989979206');
			}
		}
    else warnUser(message, 'This command is currently disabled for testing!');
	}
};
