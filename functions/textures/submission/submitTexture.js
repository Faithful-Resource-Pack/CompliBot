const settings = require('../../../resources/settings.json')
const strings = require('../../../resources/strings.json')
const choiceEmbed = require('../../../helpers/choiceEmbed')
const textures = require('../../../helpers/firestorm/texture')
const paths = require('../../../helpers/firestorm/texture_paths')

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Permissions } = require('discord.js');
const { magnifyAttachment } = require('../magnify')

const MinecraftSorter = (a, b) => {
  const aSplit = a.split('.').map(s => parseInt(s))
  const bSplit = b.split('.').map(s => parseInt(s))

  const upper = Math.min(aSplit.length, bSplit.length)
  let i = 0
  let result = 0
  while (i < upper && result == 0) {
    result = (aSplit[i] == bSplit[i]) ? 0 : (aSplit[i] < bSplit[i] ? -1 : 1) // each number
    ++i
  }

  if (result != 0) return result

  result = (aSplit.length == bSplit.length) ? 0 : (aSplit.length < bSplit.length ? -1 : 1) // longer length wins

  return result
}

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
  if (message.attachments.size == 0) return invalidSubmission(message, strings.command.push.image_not_attached)
  // same if it's not a PNG
  if (
    message.attachments.first().url.endsWith('.zip') ||
    message.attachments.first().url.endsWith('.rar') ||
    message.attachments.first().url.endsWith('.7zip')
  ) return invalidSubmission(message, strings.command.push.invalid_format)

  // if no name are given, take the image url and get it's name
  if (!search) search = message.attachments.first().url.split('/').slice(-1)[0].replace('.png', '')

  // detect co-authors as mentions:
  let mentions = message.mentions.users
  param.authors = [message.author.id]
  mentions.forEach(mention => { if (!param.authors.includes(mention.id)) param.authors.push(mention.id) })

  let results = new Array()

  // priority to ids -> faster
  if (id) {
    let texture = await textures.get(id).catch(err => invalidSubmission(message, strings.command.push.unknown_id + err))
    await makeEmbed(client, message, texture, param)
  }
  // no id given, search texture
  else if (!id && search) {
    /*var waitEmbed = new Discord.MessageEmbed()
      .setTitle('Loading')
      .setDescription(string('command.texture.searching'))
      .setColor(settings.colors.blue)
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
        description: strings.command.texture.search_description,
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
      await invalidSubmission(message, strings.command.texture.does_not_exist + '\n' + search)
    }
  }
}

const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more]
async function makeEmbed(client, message, texture, param = new Object()) {

  /** @type {import("../../helpers/firestorm/texture_use.js").TextureUse[]} */
  let uses = await texture.uses()
  let pathText = []

  for (let i = 0; uses[i]; i++) {
    let localPath = await uses[i].paths()
    pathText.push(`**${uses[i].editions[0].charAt(0).toUpperCase() + uses[i].editions[0].slice(1)}**\n`)
    for (let k = 0; localPath[k]; k++) {
      let versions = localPath[k].versions.sort(MinecraftSorter)
      pathText.push(`\`[${versions[0]}+]\` ${localPath[k].path} \n`)
    }
  }

  const paths = await uses[0].paths()
  const thumbnail = {
    path: paths[0].path,
    version: paths[0].versions.sort(MinecraftSorter).reverse()[0],
    edition: uses[0].editions[0]
  }

  let embed = new MessageEmbed()
    .setAuthor(message.author.tag, message.author.displayAvatarURL()) // TODO: add a Compliance gallery url that match his profile and show us all his recent textures
    .setColor(settings.colors.blue)
    .setTitle(`[#${texture.id}] ${texture.name}`)
    .addFields(
      { name: 'Author', value: `<@!${param.authors.join('>\n<@!').toString()}>`, inline: true },
      { name: 'Status', value: `<:pending:${settings.emojis.pending}> Pending...`, inline: true },
      { name: '\u200B', value: pathText.toString().replace(/,/g, ''), inline: false }
    )

  const attachmentThumbnail = await magnifyAttachment(`${settings.repositories.raw.default[thumbnail.edition.toLowerCase()]}${thumbnail.version}/${thumbnail.path}`)
  const attachment = new MessageAttachment(message.attachments.first().url, texture.name + '.png')

  const imgMessage = await client.channels.cache.get('916766396170518608').send({files: [attachmentThumbnail, attachment]})

  var imgArray = new Array()

  imgMessage.attachments.forEach(Attachment => {
    imgArray.push(Attachment.url)
  })

  embed.setThumbnail(imgArray[0])
  embed.setImage(imgArray[1])

  // add, if provided, the description
  if (param.description) embed.setDescription(param.description)
  // add an s to author if there is multiple authors
  if (param.authors.length > 1) embed.fields[0].name = 'Authors'

  // send the embed
  const msg = await message.channel.send({ embeds: [embed] });
  if (!message.deleted) setTimeout(() => message.delete(), 10);

  // add reactions to the embed
  for (const emojiID of EMOJIS) {
    let e = client.emojis.cache.get(emojiID)
    await msg.react(e)
  }
}

async function invalidSubmission(message, error = 'Not given') {
  if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return // allow admins to talk in submit channels
  if (message.member.roles.cache.some(role => role.name.toLowerCase().includes("art director council"))) return; // allow council to talk in submission channels

  try {
    var embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setColor(settings.colors.red)
      .setTitle(strings.submission.autoreact.error_title)
      .setFooter(strings.submission.autoreact.error_footer, message.client.user.displayAvatarURL())
      .setDescription(error)

    const msg = await message.reply({ embeds: [embed] });
    if (!msg.deleted) setTimeout(() => msg.delete(), 30000);
    if (!message.deleted) setTimeout(() => message.delete(), 30010);
  } catch (error) {
    console.error(error)
  }
}

exports.submitTexture = submitTexture