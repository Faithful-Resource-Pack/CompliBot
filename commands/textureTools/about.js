const prefix = process.env.PREFIX;

const Discord = require('discord.js');
const strings = require('../../res/strings');
const colors  = require('../../res/colors');
const fs      = require('fs');

const { warnUser } = require('../../functions/warnUser.js');

module.exports = {
	name: 'about',
	description: 'Displays texture that you or someone made',
	uses: 'Anyone',
	syntax: `${prefix}about me\n${prefix}about <userTag>\n`,
	async execute(client, message, args) {

		var textures        = JSON.parse(fs.readFileSync('./contributors/java.json'));
		var texturesBedrock = JSON.parse(fs.readFileSync('./contributors/bedrock.json'));
		var embed = new Discord.MessageEmbed();

		var javac32 = [];
		var javac64 = [];
		var bedrockc32 = [];
		var bedrockc64 = [];

		var userTag = undefined;
		var countJava32 = 0;
		var countJava64 = 0;
		var countBedrock32 = 0;
		var countBedrock64 = 0;

		const MAX = 20;
		var   max = 0

		if (args[0] == 'me' || args[0] == undefined) {
			embed.setDescription(`About <@${client.users.cache.find(u => u.tag === message.author.tag).id}> contributions:`)
				.setColor(colors.BLUE)
				.setAuthor(message.author.tag, message.author.displayAvatarURL());
			userTag = message.author.tag;
		}

		else {
			
			// allow people with space inside their tag name;
			args[0] = args.join(' ');

			try {
				client.users.cache.find(u => u.tag === args[0]).id
			} catch(error) {
				return warnUser(message, 'This user doesn\'t exist!');
			}
			
			embed.setDescription(`About <@${client.users.cache.find(u => u.tag === args[0]).id}> contributions:`)
				.setColor(colors.BLUE)
				.setAuthor(message.author.tag, message.author.displayAvatarURL());
			userTag = args[0];
		}

		for (var i = 0; i < textures.length; i++) {
			if (textures[i].c32.author != undefined && textures[i].c32.author.includes(userTag)) {
				if (max <= MAX) {
					javac32.push(textures[i].path.replace('minecraft/textures/',''));
					max++;
				}
				countJava32++;
			}
			if (textures[i].c64.author != undefined && textures[i].c64.author.includes(userTag)) {
				if (max <= MAX) {
					javac64.push(textures[i].path.replace('minecraft/textures/'));
					max++;
				}
				countJava64++;
			}
		}

		max = 0;
		for (var i = 0; i < texturesBedrock.length; i++) {
			if (texturesBedrock[i].c32.author != undefined && texturesBedrock[i].c32.author.includes(userTag) && max <= MAX) {
				if (max <= MAX) {
					bedrockc32.push(texturesBedrock[i].path.replace('textures/',''));
					max++;
				}
				countBedrock32++;
			}
			if (texturesBedrock[i].c64.author != undefined && texturesBedrock[i].c64.author.includes(userTag) && max <= MAX) {
				if (max <= MAX) {
					bedrockc64.push(texturesBedrock[i].path.replace('textures/',''));
					max++;
				}
				countBedrock64++;
			}
		}

		var embedJava = new Discord.MessageEmbed();
		var embedBedrock = new Discord.MessageEmbed();

		if (countJava32 > 0) embed.addFields({name: 'Java 32x:', value: countJava32, inline: true});
		if (countJava64 > 0) embed.addFields({name: 'Java 64x:', value: countJava64, inline: true});
		if (countBedrock32 > 0) embed.addFields({name: 'Bedrock 32x:', value: countBedrock32, inline: true});
		if (countBedrock64 > 0) embed.addFields({name: 'Bedrock 64x:', value: countBedrock64, inline: true});
		if (countJava32+countJava64+countBedrock32+countBedrock64 > 0) embed.addFields({name: 'Total:', value: countJava32+countJava64+countBedrock32+countBedrock64, inline: true});

		if (countJava32 > 0) embedJava.addFields({name: 'Java 32x:', value: javac32, inline: true});
		if (countJava64 > 0) embedJava.addFields({name: 'Java 64x:', value: javac32, inline: true});
		if (countBedrock32 > 0) embedBedrock.addFields({name: 'Bedrock 32x:', value: bedrock32, inline: true});
		if (countBedrock64 > 0) embedBedrock.addFields({name: 'Bedrock 64x:', value: bedrock64, inline: true});

		embed.setDescription(`${embed.description}\n\n1️⃣ To see Compliance Java textures list\n2️⃣ To see Compliance Bedrock textures list`)
		var embedMessage = await message.channel.send(embed);
		loop(embedMessage, message, embed, embedJava, embedBedrock);
	}
}

async function loop(embedMessage, message, embed, embedJava, embedBedrock) {
	embedMessage.react('🗑️');
	embedMessage.react('1️⃣');
	embedMessage.react('2️⃣');
			
	const filter = (reaction, user) => {
		return ['🗑️','1️⃣','2️⃣'].includes(reaction.emoji.name) && user.id === message.author.id;
	};

	embedMessage.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
		.then(async collected => {
			const reaction = collected.first();
		
			if (reaction.emoji.name === '🗑️') {
				embedMessage.delete();
				message.delete();
			}
			
			if (reaction.emoji.name === '1️⃣') {
				embed.fields = embedJava.fields;
			}
			if (reaction.emoji.name === '2️⃣') {
				embed.fields = embedBedrock.fields;
			}

			if (reaction.emoji.name === '1️⃣' || reaction.emoji.name === '2️⃣') {
				embedMessage.reactions.cache.get('🗑️').remove();
				embedMessage.reactions.cache.get('1️⃣').remove();
				embedMessage.reactions.cache.get('2️⃣').remove();
				embedMessage.edit(embed);
				loop(embedMessage, message, embed, embedJava, embedBedrock);
			}	
		}).catch(async () => {
			embedMessage.reactions.cache.get('🗑️').remove();
			embedMessage.reactions.cache.get('1️⃣').remove();
			embedMessage.reactions.cache.get('2️⃣').remove();
		});
}