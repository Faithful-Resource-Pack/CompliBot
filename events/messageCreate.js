const client = require('../index').Client
const lastMessages = require('../functions/lastMessages')
const meant = require('meant')

const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { Permissions } = require('discord.js')

const DEV = (process.env.DEV.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')
const PREFIX = process.env.PREFIX
const UIDA = [
  process.env.UIDR,
  process.env.UIDD,
  process.env.UIDT,
  process.env.UIDJ
]

const strings = require('../resources/strings.json')
const settings = require('../resources/settings.json')

const { textureIDQuote } = require('../functions/textures/textureIDQuote')
const { submitTexture } = require('../functions/textures/submission/submitTexture')
const { inviteDetection } = require('../functions/moderation/inviteDetection')
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
      if (MAINTENANCE && !UIDA.includes(message.author.id)) {
        const msg = await message.reply({ content: strings.command.maintenance })
        await message.react('❌')
        if (!message.deleted) setTimeout(() => msg.delete(), 30000);
      }

      const args = message.content.toLowerCase().slice(PREFIX.length).trim().split(/ +/)
      const commandName = args.shift().toLowerCase()
      const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName))

      if (!command) {
        // Suggest commands if not found in command list
        let commandList = new Array()
        client.commands.forEach(command => {
          commandList.push(command.name)
        })

        const meantCmd = await meant(commandName, commandList)

        if (meantCmd?.length !== 0) {
          const row = new MessageActionRow()
            .addComponents(
              new MessageButton()
                .setCustomId('meantBtn')
                .setLabel('Run command')
                .setStyle('PRIMARY'),
            );
          const meantMsg = await message.reply({ content: `Did you mean \`${PREFIX}${meantCmd[0]}\`?`, components: [row] })

          const filter = i => i.customId === 'meantBtn' && i.user.id === message.author.id;

          const collector = message.channel.createMessageComponentCollector({ filter, time: 1000 * 60 }); // 1 minute

          collector.on('collect', async i => {
            if (i.customId === 'meantBtn') {
              if (!meantMsg.deleted) await meantMsg.delete();

              lastMessages.addMessage(message)

              await client.commands.get(meantCmd[0]).execute(client, message, args).then(async () => {
                return increaseCommandProcessed()
              })
            }
          });

          collector.on('end', async () => { if (!meantMsg.deleted) return await meantMsg.edit({ content: `Did you mean \`${PREFIX}${meantCmd[0]}\`?`, components: [] }).catch(() => { }) }); // catch to avoid "Unknown Message" error, I don't know why this is happening
        }
        else return
      }
      else {
        if (command.guildOnly && message.channel.type === 'DM') return warnUser(message, strings.bot.cant_dm)


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
          await message.react('❌')
          return addDeleteReact(msgEmbed, message, true)
        })
      }
    }

    else {
      if (DEV) return

      /**
       * TEXTURE ID QUOTE
       * when someone type [#1234], send an embed with the given texture id
       * @author Juknum
       */
      textureIDQuote(message)

      /**
       * DISCORD SERVER INVITE DETECTION
       * @warn I hope there is no other use of this link type on Discord
       * Found more information here: https://youtu.be/-51AfyMqnpI
       * @author RobertR11
       */
      inviteDetection(client, message)

      /**
       * TEXTURE SUBMISSION
       */
      if (
        message.channel.id === settings.channels.submit_textures.c32 ||
        message.channel.id === settings.channels.submit_textures.c64 || // OLD
        message.channel.id === '931887174977208370' ||
        message.channel.id === settings.channels.submit_textures.cdungeons
      ) return submitTexture(client, message)

      /**
       * CLASSIC FAITHFUL BASIC AUTOREACT
       */
      if (message.channel.id === '814631514523435020') {
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
