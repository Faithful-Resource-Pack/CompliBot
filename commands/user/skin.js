const prefix = process.env.PREFIX;

const axios   = require('axios');
const Discord = require("discord.js");
const colors  = require('../../resources/colors');
const strings = require('../../resources/strings');

const { Buffer } = require('buffer');
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

		const response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${args[0]}`, {
			headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
		})

		if (response.data.id == undefined) return await warnUser(message, 'That player doesn\'t exist!');

		const mojangProfile = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${response.data.id}`, {
			headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
		})

		const mojangTextures = Buffer.from(mojangProfile.data.properties[0].value, 'base64').toString('utf-8')
		const skinJson = JSON.parse(mojangTextures);

		const attachment = new Discord.MessageAttachment(`https://visage.surgeplay.com/full/512/${response.data.id}`, 'skin.png');

		var embed = new Discord.MessageEmbed()
			//.setAuthor('This command is still experimental, skins may not load!')
			.setTitle(`${args[0]}'s Skin`)
			.setColor(colors.BLUE)
			.setDescription(`UUID: ${response.data.id}`)
			//.setImage(`https://visage.surgeplay.com/full/512/${response.data.id}.png`)
			.setImage('attachment://skin.png')
			.setThumbnail(skinJson.textures.SKIN.url)
			//.setFooter('Powered by visage.surgeplay.com', 'https://visage.surgeplay.com/steve.png')

		const embedMessage = await message.reply({embeds: [embed], files: [attachment]});
		addDeleteReact(embedMessage, message, true)
	}
};