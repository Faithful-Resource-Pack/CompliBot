const prefix = process.env.PREFIX;

const Discord  = require("discord.js");
const settings = require('../settings.js');
const strings  = require('../res/strings');

const { warnUser } = require('../functions/warnUser.js');

module.exports = {
	name: 'modtools',
	description: strings.HELP_DESC_MODTOOLS,
	guildOnly: true,
	uses: strings.COMMAND_USES_ANYONE_DUNGEONS,
	syntax: `${prefix}modtools`,
	async execute(client, message, args) {
		if (message.guild.id !== settings.CDUNGEONS_ID) return warnUser(message,'This command can only be used in the Compliance Dungeons server!');

		const embed = new Discord.MessageEmbed()
			.setTitle('Tools for making Dungeons mods:')
			.setColor(settings.CDUNGEONS_COLOR)
			.setThumbnail(settings.CDUNGEONS_IMG)
			.addFields(
				{ name: 'Dungeons mod kit by CCCode:', value: 'https://github.com/Dokucraft/Dungeons-Mod-Kit', inline: true },
				{ name: 'Loading icon creator:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/loader', inline: true },
				{ name: 'Alpha image converter:', value: 'https://github.com/Faithful-Dungeons/Resource-Pack/tree/master/Tools/alpha_img', inline: true },
			)
			.setFooter('Compliance Dungeons', settings.CDUNGEONS_IMG);

		await message.inlineReply(embed);
	}
};
