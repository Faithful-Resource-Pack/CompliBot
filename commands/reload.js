const Discord  = require('discord.js');
const speech   = require('../messages.js');
const settings = require('../settings.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;
uidD = process.env.UIDD;

module.exports = {
	name: 'reload',
	aliases: ['r'],
	description: 'Reloads a command',
	uses: 'Bot Developers',
	syntax: `${prefix}reload <command>`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD) {
			const commandName = args[0].toLowerCase();
			const command = message.client.commands.get(commandName) || message.client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) {
        const embed = new Discord.MessageEmbed()
	        .setColor(settings.RED_COLOR)
          .setTitle(speech.BOT_ERROR)
          .setDescription(`There is no command with name or alias \`${commandName}\`!`)

			  const embedMessage = await message.channel.send(embed)
        await message.react('❌');
        await embedMessage.delete({timeout: 30000});
			}

			delete require.cache[require.resolve(`./${command.name}.js`)];

			try {
				const newCommand = require(`./${command.name}.js`);
				message.client.commands.set(newCommand.name, newCommand);
				await message.react('✅');
			} catch (error) {
				console.error(error);
				await message.react('❌');
			}
		}
		else {
			const msg = await message.reply(speech.COMMAND_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};