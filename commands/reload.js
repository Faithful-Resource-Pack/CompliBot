const speech = require('../messages.js');

uidR = process.env.UIDR;
uidJ = process.env.UIDJ;

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
        const msg = await message.reply(`there is no command with name or alias \`${commandName}\`!`);
        await message.react('❌');
        await msg.delete({timeout: 30000});
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
			const msg = await message.reply(speech.BOT_NO_PERMISSION);
      await message.react('❌');
      await msg.delete({timeout: 30000});
		}
	}
};