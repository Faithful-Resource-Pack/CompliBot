const Discord     = require('discord.js')
const settings    = require('../../../resources/settings')
const colors      = require('../../../resources/colors')
const strings     = require('../../../resources/strings')
const emojis      = require('../../../resources/emojis')
const choiceEmbed = require('../../../helpers/choiceEmbed')
const textures    = require('../../../helpers/firestorm/texture')
const paths       = require('../../../helpers/firestorm/texture_paths')

/**
 * Check if the given texture exist, and embed it if true
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordMessage} message
 */
async function submitTexture(client, message) {
  let args = message.content.split(' ')

  // get the texture ID
  let id = args.filter(el => el.startsWith('(#') && el.endsWith(')') && !isNaN(el.slice(2).slice(0, -1))).map(el => el.slice(2).slice(0, -1))
  id = id[0]
  // get the name
  let search = args.filter(el => el.startsWith('(') && el.endsWith(')')).map(el => el.slice(1).slice(0, -1))
  search = search[0]
  // get the description
  let description = args.join(' ').replace(`(${search})`, '').replace(`[#${id}]`, '')

  // parameters for the embed
  let param = {
    description: description,
  }

  // same if no file is attached
  if (message.attachments.size == 0) return invalidSubmission(message, strings.PUSH_NOT_ATTACHED)
  // same if it's not a PNG
  if (
    message.attachments.first().url.endsWith('.zip')  ||
    message.attachments.first().url.endsWith('.rar')  ||
    message.attachments.first().url.endsWith('.7zip')
  ) return invalidSubmission(message, strings.PUSH_INVALID_FORMAT)

  // if no name are given, take the image url and get it's name
  if (!search) search = message.attachments.first().url.split('/').slice(-1)[0].replace('.png', '')

  // detect co-authors as mentions:
  let mentions  = message.mentions.users
  param.authors = [ message.author.id ]
  mentions.forEach(mention => { if (!param.authors.includes(mention.id)) param.authors.push(mention.id) })

  let results = new Array()
  
  // priority to ids -> faster
  if (id) {
    let texture = await textures.get(id).catch(err => invalidSubmission(message, strings.PUSH_UNKNOWN_ID + err))
    await makeEmbed(client, message, texture, param)
  }
  // no id given, search texture
  else if (!id && search) {
    /*var waitEmbed = new Discord.MessageEmbed()
      .setTitle('Loading')
      .setDescription(strings.COMMAND_SEARCHING_FOR_TEXTURE)
      .setColor(colors.BLUE)
    const waitEmbedMessage = await message.reply({embeds: [waitEmbed]});*/

    // partial texture name (_sword, _axe -> diamond_sword, diamond_axe...)
    if (search.startsWith('_') || search.endsWith('_')) {
      results = await textures.search([{
        field: "name",
        criteria: "includes",
        value: search
      }])
    }
    // looking for path + texture (block/stone -> stone)
    else if (search.startsWith('/') || search.endsWith('/')) {
      results = await paths.search([{
        field: "path",
        criteria: "includes",
        value: search
      }])
      // transform paths results into textures
      let output = new Array()
      for (let i = 0; results[i]; i++) {
        let use = await results[i].use()
        output.push(await textures.get(use.textureID))
      }
      results = output
    }
    // looking for all exact matches (stone -> stone.png)
    else {
      results = await textures.search([{
        field: "name",
        criteria: "==",
        value: search
      }])

      if (results.length == 0) {
        // no equal result, searching with includes
        results = await textures.search([{
          field: "name",
          criteria: 'includes',
          value: search
        }])
      }
    }

    if (results.length > 1) {
      let choice = [];
      for (let i = 0; results[i]; i++) {
        let uses = await results[i].uses()
        let paths = await uses[0].paths()

        choice.push(`\`[#${results[i].id}]\` ${results[i].name.replace(search, `**${search}**`).replace(/_/g, '\\_')} — ${paths[0].path.replace(search, `**${search}**`).replace(/_/g, '\\_')}`)
      }

      //if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete();
      choiceEmbed(message, {
        title: `${results.length} results, react to choose one!`,
        description: strings.TEXTURE_SEARCH_DESCRIPTION,
        footer: `${message.client.user.username}`,
        propositions: choice
      })
        .then(choice => {
          return makeEmbed(client, message, results[choice.index], param)
        })
        .catch((message, error) => {
          if (process.env.DEBUG) console.error(message, error)
        })
    }
    else if (results.length == 1) {
      await makeEmbed(client, message, results[0], param)
      //if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete()
    }
    else {
      //if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete()
      await invalidSubmission(message, strings.TEXTURE_DOESNT_EXIST + '\n' + search)
    }
  }
}

const EMOJIS = [emojis.UPVOTE, emojis.DOWNVOTE, emojis.SEE_MORE]
async function makeEmbed(client, message, texture, param = new Object()) {

  /** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
  let uses = await texture.uses()
  let pathText = []

  for (let i = 0; uses[i]; i++) {
    let localPath = await uses[i].paths()
    pathText.push(`**${uses[i].editions[0].charAt(0).toUpperCase() + uses[i].editions[0].slice(1)}**`)
    for (let k = 0; localPath[k]; k++) pathText.push(`\`[${localPath[k].versions[localPath[k].versions.length - 1]}+]\` ${localPath[k].path}`)
  }

  let embed = new Discord.MessageEmbed()
  .setAuthor(message.author.tag, message.author.displayAvatarURL()) // TODO: add a Compliance gallery url that match his profile and show us all his recent textures
  .setColor(colors.BLUE)
  .setTitle(`[#${texture.id}] ${texture.name}`)
  //.setImage(message.attachments.first().url)
  .addFields(
    { name: 'Author', value: `<@!${param.authors.join('>\n<@!')}>`, inline: true },
    { name: 'Status', value: '⏳ Pending...', inline: true },
    { name: '\u200B', value: pathText, inline: false }
  )
  
  // re-upload the image to the new message, avoid broken link (rename it in the same time)
  const attachment = new Discord.MessageAttachment(message.attachments.first().url, texture.name + '.png')
  embed.attachFiles(attachment).setImage(`attachment://${texture.name}.png`)

  // add, if provided, the description
  if (param.description) embed.setDescription(param.description)
  // add an s to author if there is multiple authors
  if (param.authors.length > 1) embed.fields[0].name = 'Authors'

  // send the embed
  const msg = await message.channel.send({embeds: [embed]});
  if (!message.deleted) await message.delete({ timeout: 10 })

  // add reactions to the embed
  for (const emojiID of EMOJIS) {
    let e = client.emojis.cache.get(emojiID)
    await msg.react(e)
  }
}

async function invalidSubmission(message, error = 'Not given') {
  if (message.member.hasPermission('ADMINISTRATOR')) return // allow admins to talk in submit channels
  
  try {
    var embed = new Discord.MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor(colors.RED)
      .setTitle(strings.SUBMIT_AUTOREACT_ERROR_TITLE)
      .setFooter(strings.SUBMIT_AUTOREACT_ERROR_FOOTER, settings.BOT_IMG)
      .setDescription(error)

    const msg = await message.reply({embeds: [embed]});
    if (!msg.deleted) await msg.delete({ timeout: 30000 })
    if (!message.deleted) await message.delete({ timeout: 10 })
  } catch (error) {
    console.error(error)
  }
}

exports.submitTexture = submitTexture