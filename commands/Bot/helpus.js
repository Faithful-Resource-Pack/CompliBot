const prefix = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidT = process.env.UIDT

const DEVS = [uidR, uidJ, uidT]

const { MessageEmbed } = require("discord.js")
const strings = require('../../resources/strings.json')

const { addDeleteReact } = require("../../helpers/addDeleteReact")
const unhandledRejection = require("../../events/unhandledRejection")

module.exports = {
	name: 'helpus',
	aliases: ['dev'],
	description: 'Command to get infos on how to help the devs',
	category: 'Bot',
	guildOnly: false,
	uses: strings.command.use.anyone,
	syntax: `${prefix}helpus`,
  /**
   * @param {import('discord.js').Client} client 
   * @param {import('discord.js').Message} message
   */
	async execute(client, message) {
    const embed = new MessageEmbed()
      .setTitle('Do you want to help or support us in the Compliance development?')
      .setDescription('You love this project and you want to help the devs?\n' + 
        'Please contact one of the devs to be invited to the development server:\n' + 
        DEVS.map(d => `<@!${d}>`).join(', ') + '\n\n' + 
        'You can also check us out on GitHub: https://github.com/Compliance-Resource-Pack')
      .setThumbnail(client.user.avatarURL())
      .setFooter(client.user.username, client.user.displayAvatarURL())

    let prom
    prom = message.reply({
      embeds: [embed]
    })
    
    prom.then(embedMessage => {
      prom = addDeleteReact(embedMessage, message, true)

      return prom
    }).catch(error => {
      unhandledRejection(client, error, prom, message)
    })
  }
}