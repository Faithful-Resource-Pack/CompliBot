const prefix = process.env.PREFIX;

const settings = require('../../resources/settings');
const strings  = require('../../resources/strings');

const uidR = process.env.UIDR;
const uidJ = process.env.UIDJ;

module.exports = {
	name: 'discords',
	description: strings.HELP_DESC_DISCORDS,
	guildOnly: true,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}discords`,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (message.guild.id === settings.C32_ID || message.guild.id === settings.C64_ID || message.guild.id === settings.CEXTRAS_ID ) {
				await message.channel.send({content: 'Compliance 32x:\n> https://discord.gg/sN9YRQbBv7'});
				await message.channel.send({content: 'Compliance 64x:\n> https://discord.gg/Tqtwtgh'});
				await message.channel.send({content: 'Compliance Extras:\n> https://discord.gg/qVeDfZw'});
				await message.channel.send({content: 'Minecraft:\n> https://discord.gg/minecraft'});
				await message.channel.send({content: 'Optifine:\n> https://discord.gg/3mMpcwW'});
				await message.channel.send({content: 'Blockbench:\n> https://discord.gg/fZQbxbg'});
			}
		} else return
	}
};
