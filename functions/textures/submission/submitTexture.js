const settings = require('../../../resources/settings.json')
const strings = require('../../../resources/strings.json')
const choiceEmbed = require('../../../helpers/choiceEmbed')
const textures = require('../../../helpers/firestorm/texture')
const paths = require('../../../helpers/firestorm/texture_paths')
const MinecraftSorter = require('../minecraftSorter')
const CanvasDrawer = require('../../../functions/textures/canvas')
const Canvas = require('canvas')

const { MessageEmbed, MessageAttachment } = require('discord.js');
const { Permissions } = require('discord.js');
const { magnifyAttachment } = require('../magnify')

/**
 * Check if the given texture exist, and embed it if true
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordMessage} message
 */
async function submitTexture(client, message) {
  // break if no file is attached
  if (message.attachments.size == 0) return invalidSubmission(message, strings.command.push.image_not_attached)
  let args = message.content.split(' ')

  // not entirely sure why the first arg exists but it seems to fix problems I had with iterating over maps
  for (let [_, attachment] of message.attachments) {
    // break if it's not a PNG
    if (!attachment.url.endsWith('.png')) {
      invalidSubmission(message, strings.command.push.invalid_format);
      continue;
    }
    // get the texture ID
    let id = args.filter(el => el.startsWith('(#') && el.endsWith(')') && !isNaN(el.slice(2).slice(0, -1))).map(el => el.slice(2).slice(0, -1))
    id = id[0]

    // take image url to get name of texture
    let search = attachment.url.split('/').slice(-1)[0].replace('.png', '')

    // get the description
    let description = message.content.replace(`(${search})`, '').replace(`[#${id}]`, '')

    // parameters for the embed
    let param = {
      description: description,
    }

    // detect co-authors:

    param.authors = [message.author.id];

    // detect using curly bracket syntax (e.g. {Author})
    let names = [...message.content.matchAll(/(?<=\{)(.*?)(?=\})/g)];

    // map to only get the first bit and trim any whitespace so { Author } etc works
    names = names.map(i => i[0].toLowerCase().trim());

    if (names !== []) {
      const res = await fetch(`https://api.faithfulpack.net/v2/contributions/authors`);
      const contributionJSON = await res.json();
      for (let user of contributionJSON) {
        if (!user.username) continue; // if no username set it will throw an error otherwise
        if (names.includes(user.username.toLowerCase())) {
          param.authors.push(user.id);
        }
      }
    }

    // detect by ping (using regex to ensure users not in the server get included)
    let mentions = [...message.content.matchAll(/(?<=\<\@)(.*?)(?=\>)/g)];
    mentions = mentions.map(i => i[0]); // map to only get the first bit
    mentions.forEach(mention => {
      if (!param.authors.includes(mention)) param.authors.push(mention)
    })

    let results = new Array()

    // priority to ids -> faster
    if (id) {
      let texture = await textures.get(id).catch(err => invalidSubmission(message, strings.command.push.unknown_id + err))
      await makeEmbed(client, message, texture, attachment, param)
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
            makeEmbed(client, message, results[choice.index], attachment, param)
          })
          .catch((message, error) => {
            if (process.env.DEBUG) console.error(message, error)
          })
          continue;
      }
      else if (results.length == 1) {
        await makeEmbed(client, message, results[0], attachment, param)
        //if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete()
      }
      else {
        //if (!waitEmbedMessage.deleted) await waitEmbedMessage.delete()
        await invalidSubmission(message, strings.command.texture.does_not_exist + '\n' + search)
      }
    }
  }
  if (!message.deleted) setTimeout(() => message.delete(), 10);
}

const EMOJIS = [settings.emojis.upvote, settings.emojis.downvote, settings.emojis.see_more]
async function makeEmbed(client, message, texture, attachment, param = new Object()) {

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
  const info = {
    path: paths[0].path,
    version: paths[0].versions.sort(MinecraftSorter).reverse()[0],
    edition: uses[0].editions[0]
  }

  // TODO: when discord finishes name migration remove this code and just use message.author.username everywhere
  const authorName = (message.author.discriminator == 0)
    ? `@${message.author.username}`
    : message.author.tag

  let embed = new MessageEmbed()
    .setAuthor(authorName, message.author.displayAvatarURL()) // TODO: add a Faithful gallery url that shows all textures by a given author
    .setColor(settings.colors.blue)
    .setTitle(`[#${texture.id}] ${texture.name}`)
    .setURL(`https://webapp.faithfulpack.net/#/gallery/java/32x/latest/all/?show=${texture.id}`)
    .addFields(
      { name: 'Author', value: `<@!${param.authors.join('>\n<@!').toString()}>`, inline: true },
      { name: 'Status', value: `<:pending:${settings.emojis.pending}> Pending...`, inline: true },
      { name: '\u200B', value: pathText.toString().replace(/,/g, ''), inline: false }
    )

  // determine reference image to compare against
  let repoKey;
  for (let [packKey, packValue] of Object.entries(settings.submission.packs)) {
    if (packValue.channels.submit == message.channel.id) {
      repoKey = packKey;
      break;
    }
  }
  let defaultRepo;
  switch (repoKey) {
    case "faithful_64x":
      defaultRepo = settings.repositories.raw.faithful_32x;
      break;
    case "classic_faithful_64x":
      defaultRepo = settings.repositories.raw.classic_faithful_32x;
      break;
    default:
      defaultRepo = settings.repositories.raw.default;
      break;
  }

  const drawer = new CanvasDrawer();
  const rawImage = new MessageAttachment(attachment.url, `${texture.name}.png`);
  const upscaledImage = await magnifyAttachment(attachment.url, 'upscaled.png');
  let defaultImage;
  try {
    defaultImage = await magnifyAttachment(`${defaultRepo[info.edition.toLowerCase()]}${info.version}/${info.path}`, 'default.png');
  } catch { // reference texture doesn't exist
    defaultImage = await magnifyAttachment(`${settings.repositories.raw.default[info.edition.toLowerCase()]}${info.version}/${info.path}`, 'default.png')
  }

  // load images necessary to generate comparison
  let currentImage;
  let imageUrls;
  try {
    currentImage = await magnifyAttachment(`${settings.repositories.raw[repoKey][info.edition.toLowerCase()]}${info.version}/${info.path}`)
    imageUrls = await getImages(client, [defaultImage, upscaledImage, rawImage, currentImage]);
    drawer.urls = [imageUrls[0], imageUrls[1], imageUrls[2]];

  } catch { // texture doesn't exist yet
    imageUrls = await getImages(client, [defaultImage, upscaledImage, rawImage]);
    drawer.urls = [imageUrls[0], imageUrls[1]];
  }

  // generate comparison and add to embed
  const comparisonImage = new MessageAttachment(await drawer.draw(), 'compared.png');
  const comparisonUrls = await getImages(client, [comparisonImage])

  embed.setImage(comparisonUrls[0]);
  embed.setThumbnail(imageUrls[2]);

  // add, if provided, the description
  if (param.description) embed.setDescription(param.description)
  // add an s to author if there are multiple authors
  if (param.authors.length > 1) embed.fields[0].name = 'Authors'

  // send the embed
  const msg = await message.channel.send({ embeds: [embed] });

  // add reactions to the embed
  for (const emojiID of EMOJIS) {
    let e = client.emojis.cache.get(emojiID)
    await msg.react(e)
  }
}

async function getImages(client, fileArray) {
  let imgArray = new Array();
  const imgMessage = await client.channels.cache.get('916766396170518608').send({ files: fileArray });

  imgMessage.attachments.forEach(Attachment => {
    imgArray.push(Attachment.url)
  });

  return imgArray;
}

async function invalidSubmission(message, error = 'Not given') {
  if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return // allow admins to talk in submit channels
  if (message.member.roles.cache.some(role => role.name.toLowerCase().includes("council"))) return; // allow council to talk in submission channels

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