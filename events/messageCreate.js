const client = require('../index').Client
const lastMessages = require('../functions/lastMessages')

const { MessageEmbed } = require('discord.js');

const DEV = (process.env.DEV.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')
const PREFIX = process.env.PREFIX

const strings = require('../resources/strings.json')
const settings = require('../resources/settings.json')

const { submitTexture } = require('../functions/textures/submission/submitTexture')
const { increase: increaseCommandProcessed } = require('../functions/commandProcess')

const { addDeleteReact } = require('../helpers/addDeleteReact')
const { warnUser } = require('../helpers/warnUser')

module.exports = {
  name: 'messageCreate',
  // eslint-disable-next-line no-unused-vars
  async execute(message) {
    // Ignore bot messages
    if (message.author.bot) return

    if (message.content.startsWith(PREFIX)) {
      if (MAINTENANCE && !process.env.DEVELOPERS.includes(message.author.id)) {
        const msg = await message.reply({ content: strings.command.maintenance })
        await message.react(settings.emojis.downvote)
        if (!message.deleted) setTimeout(() => msg.delete(), 30000);
      }

      const args = message.content.toLowerCase().slice(PREFIX.length).trim().split(/ +/)
      const commandName = args.shift().toLowerCase()
      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

      if (!command) return; // stops a dev error being thrown every single time a message starts with a slash
      if (command && command.guildOnly && message.channel.type === 'DM') return warnUser(message, strings.bot.cant_dm)

      lastMessages.addMessage(message)

      command.execute(client, message, args).then(async () => {
        return increaseCommandProcessed()
      }).catch(async error => {
        console.trace(error)

        const embed = new MessageEmbed()
          .setColor(settings.colors.red)
          .setTitle(strings.bot.error)
          .setThumbnail(settings.images.error)
          .setDescription(`${strings.command.error}\nError for the developers:\n${error}`)

        let msgEmbed = await message.reply({ embeds: [embed] })
        await message.react(settings.emojis.downvote)
        return addDeleteReact(msgEmbed, message, true)
      })
    }

    else {
      if (DEV) return

      /**
       * TEXTURE SUBMISSION
       */
      const submissionChannels = Object.values(settings.submission.packs).map(i => i.channels.submit);
      if (submissionChannels.includes(message.channel.id)) {
        return submitTexture(client, message);
      }

      /**
       * CLASSIC FAITHFUL ADD-ON CHANNEL REACTIONS
       */
      if (message.channel.id === '814631514523435020' || message.channel.id === '995033923304308836') {
        if (!message.attachments.size) {
          if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return
          var embed = new MessageEmbed()
            .setColor(settings.colors.red)
            .setTitle(strings.submission.autoreact.error_title)
            .setDescription(strings.submission.no_file_attached)
            .setFooter(strings.submission.autoreact.error_footer, client.user.displayAvatarURL())

          const msg = await message.reply({ embeds: [embed] })
          if (!msg.deleted) setTimeout(() => msg.delete(), 30000);
          if (!message.deleted) setTimeout(() => message.delete(), 10);
        } else {
          await message.react(settings.emojis.upvote)
          await message.react(settings.emojis.downvote)
        }
      }
    }
  }
}
