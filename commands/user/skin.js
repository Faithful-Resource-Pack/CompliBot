const prefix = process.env.PREFIX;

const axios   = require('axios');
const Discord = require("discord.js");
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');

const { warnUser } = require('../../helpers/warnUser');
const { addDeleteReact } = require('../../helpers/addDeleteReact');

module.exports = {
	name: 'skin',
	description: strings.HELP_DESC_SKIN,
	guildOnly: false,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}skin [minecraft username]`,
	example: `${prefix}skin Pomik108`,
	async execute(client, message, args) {
		return warnUser(message,strings.COMMAND_DISABLED);

		if (!args.length) return await warnUser(message, strings.COMMAND_NO_ARGUMENTS_GIVEN);

		axios.get(`https://api.mojang.com/users/profiles/minecraft/${args[0]}`)
		.then(async function (response) {
			if (response.data.id == undefined) return await warnUser(message, 'That player doesn\'t exist!');

			var embed = new Discord.MessageEmbed()
				.setAuthor('This command is still experimental, skins may not load!')
				.setTitle(`${args[0]}'s Skin`)
				.setColor(colors.BLUE)
				.setDescription(`UUID: ${response.data.id}`)
				.setImage(`https://visage.surgeplay.com/full/512/${response.data.id}`)
				.setThumbnail(`https://visage.surgeplay.com/skin/512/${response.data.id}`)
				.setFooter('Powered by visage.surgeplay.com', 'https://visage.surgeplay.com/steve.png')

			const embedMessage = await message.inlineReply(embed);
				addDeleteReact(embedMessage, message, true)
			})
			.catch(async function () {
				return await warnUser(message, 'That player doesn\'t exist!');
			});
	}
};