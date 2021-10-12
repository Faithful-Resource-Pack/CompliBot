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
	example: `${prefix}skin Pomi108`,
	async execute(client, message, args) {
		return warnUser(message,strings.COMMAND_DISABLED);

		const usersCollection = require('../../helpers/firestorm/users')
		let user = await usersCollection.get(message.author.id).catch(err => console.error(err))

		if (args[0]) return showSkin(message, args)
		else showSkin(message, undefined, user)

	}
};

async function showSkin(message, args = undefined, user = undefined) {
	let response

	if (args) {
		response = await axios.get(`https://api.mojang.com/users/profiles/minecraft/${args[0]}`, {
			headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
		})
		if (response.data.id == undefined) return await warnUser(message, 'That player doesn\'t exist!');
		else response = response.data.id
	} else response = user.uuid

	const mojangProfile = await axios.get(`https://sessionserver.mojang.com/session/minecraft/profile/${response}`, {
		headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
	})

	const mojangTextures = Buffer.from(mojangProfile.data.properties[0].value, 'base64').toString('utf-8')
	const skinJson = JSON.parse(mojangTextures);

	const skinRender = await axios.get(`https://mc-heads.net/body/${response}`,  { responseType: 'arraybuffer' })
	const attachment = new Discord.MessageAttachment(Buffer.from(skinRender.data, "utf-8"), 'skin.png');

	var embed = new Discord.MessageEmbed()
		.setColor(colors.BLUE)
		.setImage('attachment://skin.png')
		.setThumbnail(skinJson.textures.SKIN.url)
		.setFooter(`UUID: ${response}`)

	if (user) embed.setTitle('Your Skin')
	else embed.setTitle(`${args[0]}'s Skin`)

	const embedMessage = await message.reply({embeds: [embed], files: [attachment]});
	addDeleteReact(embedMessage, message, true)
}