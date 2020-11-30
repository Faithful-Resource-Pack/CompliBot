const settings = require('../settings.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

module.exports = {
	name: 'discords',
	description: 'posts a list of specified discord servers',
	execute(message, args) {
    if (message.author.id === uidR || message.author.id === uidJ) {
		  if (message.guild.id === settings.CTweaksID) {
        message.channel.send('> Help with Minecraft in general: \n https://discord.gg/minecraft')
        .then(() => message.channel.send('> Help with Minecraft Commands: \n https://discord.gg/QAFXFtZ'))
        .then(() => message.channel.send('> Help with Minecraft Resource Packs: \n https://discord.gg/tKxWtyf'))
        .then(() => message.channel.send('> Help with 3D Modelling: \n https://discord.gg/fZQbxbg'))
        .then(() => message.channel.send('> Help with Bedrock Addons: \n https://discord.gg/7uTrWuV'))
        .then(() => message.channel.send('> Original Vanilla Tweaks: \n https://discord.gg/MeJ69fN'))
        .then(() => message.channel.send('> Compliance 32x: \n https://discord.gg/sN9YRQbBv7'))
        .then(() => message.channel.send('> Compliance 64x: \n https://discord.gg/Tqtwtgh'))
        .then(() => message.channel.send('> Compliance Addons: \n https://discord.gg/qVeDfZw'))
        .then(() => message.channel.send('> Compliance 32x for Minecraft Java Mods: \n https://discord.gg/QF2CAX7'))
        .then(() => message.channel.send('> Compliance Mod for Minecraft Dungeons: \n https://discord.gg/eeVpygu'))
        .then(() => message.channel.send('> This Server: \n https://discord.gg/6psYdRF'));
      } else return
    }
    else return
	}
};