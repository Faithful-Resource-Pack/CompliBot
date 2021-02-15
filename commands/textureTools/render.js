const Discord = require('discord.js');
const colors = require('../../res/colors');
const prefix = process.env.PREFIX;

const strings = require('../../res/strings');

const { warnUser } = require('../../functions/warnUser.js');
const { render } = require('../../functions/render.js');

module.exports = {
	name: 'render',
	description: 'Soon TM',
	uses: 'Anyone (Mods for dev)',
	syntax: `${prefix}render`,

	async execute(client, message, args) {

		if (message.member.hasPermission('ADMINISTRATOR')) {

			console.log(args);

			var type='full-block';
			var textures = [
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png',
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png',
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png',
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png',
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png',
				'https://github.com/Compliance-Resource-Pack/Compliance-Java-32x/blob/Jappa-1.17/assets/minecraft/textures/block/minecraft/textures/block/stone.png'
			];

			render(message, type, textures);

		} else return warnUser(message, 'Currently in developpments, more information soon.')
	}
}