const Discord = require('discord.js');
const speech  = require('../messages');
const settings= require('../settings');

const { textureSubmission } = require('../functions/textures_submission/textureSubmission.js');
const { textureCouncil } = require('../functions/textures_submission/textureCouncil.js');
const { textureRevote } = require('../functions/textures_submission/textureRevote.js');

module.exports = {
	name: 'testembed',
	description: 'n o',
	uses: 'Bot Developers',
	syntax: `${prefix}testing`,

	async execute(client, message, args) {

		//MessageEmbed = await message.channel.messages.fetch("793222867004817522")
		//console.log(MessageEmbed.embeds)

		//textureSubmission(client, inputID, outputID, offset)
		//textureSubmission(client, '779759327665848320', '782615118231896116', 0)

		//function textureCouncil(client, inputID, outputFalseID, outputTrueID, offset)
		//textureCouncil(client,'782615118231896116', '782615215388753942', '782615236196040724', 0)

		//function textureRevote(client, inputID, outputID, offset)
		//textureRevote(client, '782615215388753942', '782615236196040724', 0)

	}
};