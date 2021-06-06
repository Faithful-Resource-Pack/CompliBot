/* eslint no-multi-spaces: "off" */
/* eslint brace-style: "off" */
const prefix = process.env.PREFIX

const Discord = require('discord.js')
const strings = require('../../ressources/strings')
const colors  = require('../../ressources/colors')

const { warnUser } = require('../../helpers/warnUser')
const { jsonContributionsJava, jsonContributionsBedrock } = require('../../helpers/fileHandler')

module.exports = {
	name: 'about',
	description: strings.HELP_DESC_ABOUT,
	guildOnly: true,
	uses: strings.COMMAND_USES_ANYONE,
	syntax: `${prefix}about me\n${prefix}about <userTag>\n`,
	example: `${prefix}about Hozz#0889`,
	async execute(client, message, args) {

		return warnUser(message,strings.COMMAND_DISABLED);

		/*
		var textures        = await jsonContributionsJava.read(false);
		var texturesBedrock = await jsonContributionsBedrock.read(false);
		var embed           = new Discord.MessageEmbed();

		var javac32    = [];
		var javac64    = [];
		var bedrockc32 = [];
		var bedrockc64 = [];

		var userTag        = undefined;
		var countJava32    = 0;
		var countJava64    = 0;
		var countBedrock32 = 0;
		var countBedrock64 = 0;

		const MAX  = 20;
		var maxj32 = 0;
		var maxj64 = 0;
		var maxb32 = 0;
		var maxb64 = 0;

		if (args[0] == 'me' || args[0] == undefined) {
			embed.setDescription(`About <@${client.users.cache.find(u => u.tag === message.author.tag).id}>'s contributions:`)
				.setColor(colors.BLUE)
				.setAuthor(message.author.tag, message.author.displayAvatarURL());
			userID  = client.users.cache.find(u => u.tag === message.author.tag).id;
			userTag = message.author.tag;
		}

		else {
			
			// allow people with space inside their tag name;
			//args[0] = args.join(' ');

			try {
				client.users.cache.find(u => u.tag === args[0]).id
			} catch(error) {
				return warnUser(message, strings.COMMAND_USER_DOESNT_EXIST);
			}
			
			embed.setDescription(`About <@${client.users.cache.find(u => u.tag === args[0]).id}> contributions:`)
				.setColor(colors.BLUE)
				.setAuthor(message.author.tag, message.author.displayAvatarURL());
			userID  = client.users.cache.find(u => u.tag === args[0]).id;
			userTag = args[0];
		}

		/** JAVA *******************************/
		/*
		for (var i = 0; i < textures.length; i++) {
			if (textures[i].c32.author != undefined && textures[i].c32.author.includes(userID)) {
				if (maxj32 <= MAX) {
					javac32.push(textures[i].version[strings.LATEST_MC_JE_VERSION].replace('minecraft/textures/',''));
					maxj32++;
				}
				countJava32++;
			}
			if (textures[i].c64.author != undefined && textures[i].c64.author.includes(userID)) {
				if (maxj64 <= MAX) {
					javac64.push(textures[i].version[strings.LATEST_MC_JE_VERSION].replace('minecraft/textures/',''));
					maxj64++;
				}
				countJava64++;
				//console.log(textures[i].version[strings.LATEST_MC_JE_VERSION]);
			}
		}

		/** BEDROCK ****************************/
		/*
		for (var i = 0; i < texturesBedrock.length; i++) {
			if (texturesBedrock[i].c32.author != undefined && texturesBedrock[i].c32.author.includes(userID)) {
				if (maxb32 <= MAX) {
					bedrockc32.push(texturesBedrock[i].version[strings.LATEST_MC_BE_VERSION].replace('textures/',''));
					maxb32++;
				}
				countBedrock32++;
			}
			if (texturesBedrock[i].c64.author != undefined && texturesBedrock[i].c64.author.includes(userID)) {
				if (maxb64 <= MAX) {
					bedrockc64.push(texturesBedrock[i].version[strings.LATEST_MC_BE_VERSION].replace('textures/',''));
					maxb64++;
				}
				countBedrock64++;
			}
		}

		var embedJava = new Discord.MessageEmbed();
		var embedBedrock = new Discord.MessageEmbed();

		if (countJava32 > 0)    embed.addField('Java 32x:', countJava32, true);
		if (countJava64 > 0)    embed.addField('Java 64x:', countJava64, true);
		if (countBedrock32 > 0) embed.addField('Bedrock 32x:', countBedrock32, true);
		if (countBedrock64 > 0) embed.addField('Bedrock 64x:', countBedrock64, true);
		if (countJava32+countJava64+countBedrock32+countBedrock64 > 0) embed.addField('Total:', countJava32+countJava64+countBedrock32+countBedrock64, true);

		if (countJava32 > 0 && javac32[0] != undefined)       embedJava.addField('Java 32x:', javac32, true);
		if (countJava64 > 0 && javac64[0] != undefined)       embedJava.addField('Java 64x:', javac64, true);
		if (countBedrock32 > 0 && bedrockc32[0] != undefined) embedBedrock.addField('Bedrock 32x:', bedrockc32, true);
		if (countBedrock64 > 0 && bedrockc64[0] != undefined) embedBedrock.addField('Bedrock 64x:', bedrockc64, true);

		/*else {
			if (args[0] == 'me' || args[0] == undefined) return await warnUser(message, 'You don\'t have any contributions!');
			else return await warnUser(message, 'The specified user doesn\'t have any contributions!');
		}*/
	/*
		embed.setDescription(`${embed.description}\n\n1️⃣ To see the Compliance Java texture list\n2️⃣ To see the Compliance Bedrock texture list`)
		var embedMessage = await message.inlineReply(embed);
		loop(embedMessage, message, embed, embedJava, embedBedrock);*/
	}
}

async function loop (embedMessage, message, embed, embedJava, embedBedrock) {
  await embedMessage.react('🗑️')
  await embedMessage.react('1️⃣')
  await embedMessage.react('2️⃣')

	/**
	 * TODO: use addDeleteReact() instead
	 */
  const filter = (reaction, user) => {
    return ['🗑️', '1️⃣', '2️⃣'].includes(reaction.emoji.name) && user.id === message.author.id
  }

  embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
    .then(async collected => {
      const reaction = collected.first()

      if (reaction.emoji.name === '🗑️') {
        await embedMessage.delete()
        if (!message.deleted) await message.delete()
      }

      if (reaction.emoji.name === '1️⃣') {
        embed.fields = embedJava.fields
      }
      if (reaction.emoji.name === '2️⃣') {
        embed.fields = embedBedrock.fields
      }

      if (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') {
        await embedMessage.reactions.cache.get('🗑️').remove()
        await embedMessage.reactions.cache.get('1️⃣').remove()
        await embedMessage.reactions.cache.get('2️⃣').remove()
        await embedMessage.edit(embed)
        await loop(embedMessage, message, embed, embedJava, embedBedrock)
      }
    }).catch(async () => {
      await embedMessage.reactions.cache.get('🗑️').remove()
      await embedMessage.reactions.cache.get('1️⃣').remove()
      await embedMessage.reactions.cache.get('2️⃣').remove()
    })
}
