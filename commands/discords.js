const settings = require('../settings.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'discords',
	description: 'posts a list of specified discord servers',
	execute(message, args) {
		if (message.author.id === uidR || message.author.id === uidJ) {
			if (message.guild.id === settings.CTweaksID) {
				message.channel.send('> Help with Minecraft in general: \nhttps://discord.gg/minecraft')
				.then(() => message.channel.send('> Help with Minecraft Commands: \nhttps://discord.gg/QAFXFtZ'))
				.then(() => message.channel.send('> Help with Minecraft Resource Packs: \nhttps://discord.gg/tKxWtyf'))
				.then(() => message.channel.send('> Help with 3D Modelling: \nhttps://discord.gg/fZQbxbg'))
				.then(() => message.channel.send('> Help with Bedrock Addons: \nhttps://discord.gg/7uTrWuV'))
				.then(() => message.channel.send('> Original Vanilla Tweaks: \nhttps://discord.gg/MeJ69fN'))
				.then(() => message.channel.send('> Compliance 32x: \nhttps://discord.gg/sN9YRQbBv7'))
				.then(() => message.channel.send('> Compliance 64x: \nhttps://discord.gg/Tqtwtgh'))
				.then(() => message.channel.send('> Compliance Addons: \nhttps://discord.gg/qVeDfZw'))
				.then(() => message.channel.send('> Compliance 32x for Minecraft Java Mods: \nhttps://discord.gg/QF2CAX7'))
				.then(() => message.channel.send('> Compliance Mod for Minecraft Dungeons: \nhttps://discord.gg/eeVpygu'))
				.then(() => message.channel.send('> This Server: \nhttps://discord.gg/6psYdRF'));
			} else return
		} else return
	}
};