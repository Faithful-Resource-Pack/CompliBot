const emojis   = require('../../../ressources/emojis')
const settings = require('../../../ressources/settings')
const colors   = require('../../../ressources/colors')

const { magnify } = require('../../../functions/textures/magnify')
const { palette } = require('../../../functions/textures/palette')

/**
 * Edit the embed of the submission
 * @author Juknum
 * @param {DiscordClient} client
 * @param {DiscordReaction} reaction
 * @param {DiscordUser} user
 */
async function editSubmission(client, reaction, user) {
  const message  = await reaction.message.fetch()
  const member   = await message.guild.members.cache.get(user.id)
  if (member.bot === true) return
  if (message.embeds.length == 0 || message.embeds[0].fields.length == 0) return

  const authorID = await message.embeds[0].fields[0].value.split('\n').map(el => el.replace('<@', '').replace('!', '').replace('>', ''))[0]

  if (reaction.emoji.id === emojis.SEE_MORE) {

    reaction.remove().catch(err => { if (process.DEBUG) console.error(err)} )

    let EMOJIS = [emojis.SEE_LESS, emojis.INSTAPASS, emojis.INVALID, emojis.DELETE, emojis.MAGNIFY, emojis.PALETTE]

    // if the message does not have up/down vote react, remove INSTAPASS & INVALID from the emojis list (already instapassed or votes flushed)
    if (!message.embeds[0].fields[1].value.includes('⏳')) EMOJIS = EMOJIS.filter(emoji => emoji !== emojis.INSTAPASS && emoji !== emojis.INVALID && emoji !== emojis.DELETE)

		// if the message is in #council-vote #texture-revote, remove delete reaction (avoid missclick)
		if (message.channel.id === settings.C32_SUBMIT_COUNCIL || message.channel.id === settings.C32_SUBMIT_REVOTE || message.channel.id === settings.C32_SUBMIT_COUNCIL || message.channel.id === settings.C32_SUBMIT_REVOTE) EMOJIS = EMOJIS.filter(emoji => emoji !== emojis.DELETE)

    // add reacts
    for (let i = 0; EMOJIS[i]; i++) await message.react(EMOJIS[i])

    // make the filter
    const filter = (REACT, USER) => {
      return EMOJIS.includes(REACT.emoji.id) && USER.id === user.id
    }

    // await reaction from the user
    message.awaitReactions(filter, { max: 1, time: 30000, errors: [ 'time' ] })
    .then(async collected => {
      const REACTION = collected.first()
      const USER_ID = collected.first().users.cache.array().filter(user => user.bot === false).map(user => user.id)[0]

      if (REACTION.emoji.id === emojis.PALETTE) palette(message, message.embeds[0].image.url, user.id)
      if (REACTION.emoji.id === emojis.MAGNIFY) magnify(message, message.embeds[0].image.url, user.id)

      /**
       * TODO: for instapass & flush reacts, check if the user who reacted have the Council role, and not admin perms
       */
      if (REACTION.emoji.id === emojis.INSTAPASS && member.hasPermission('ADMINISTRATOR')) {
        removeReact(message, [emojis.UPVOTE, emojis.DOWNVOTE])
        changeStatus(message, `<:instapass:${emojis.INSTAPASS}> Instapassed`)
        instapass(client, message)
      }
      if (REACTION.emoji.id === emojis.INVALID && member.hasPermission('ADMINISTRATOR')) {
        removeReact(message, [emojis.UPVOTE, emojis.DOWNVOTE])
        changeStatus(message, `<:invalid:${emojis.INVALID}> Invalid`)
      }

      // delete message only if the first author of the field 0 is the discord user who reacted, or if the user who react is admin
      if (REACTION.emoji.id === emojis.DELETE && (USER_ID === authorID || member.hasPermission('ADMINISTRATOR'))) return await message.delete()

      removeReact(message, EMOJIS)
      await message.react(client.emojis.cache.get(emojis.SEE_MORE))

    })
    .catch(async () => {
      if (!message.deleted) {
        removeReact(message, EMOJIS)
        await message.react(client.emojis.cache.get(emojis.SEE_MORE))
      }
    })
  }
  
}

async function instapass(client, message) {
  let channelOut
  if (message.channel.id == settings.C32_SUBMIT_TEXTURES)      channelOut = client.channels.cache.get(settings.C32_RESULTS)
  else if (message.channel.id == settings.C64_SUBMIT_TEXTURES) channelOut = client.channels.cache.get(settings.C64_RESULTS)

  channelOut.send(
    message.embeds[0]
      .setColor(colors.GREEN)
      .setDescription(`[Original Post](${message.url})\n${message.embeds[0].description ? message.embeds[0].description : ''}`)
  )
  .then(async sentMessage => {
      for (const emojiID of [emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
    })

  editEmbed(message)
}

async function editEmbed(message) {
  let embed = message.embeds[0]
  // fix the weird bug that also apply changes to the old embed (wtf)
	if (message.channel.id == '841396215211360296') embed.setColor(colors.BLUE)
  else if (message.channel.id == settings.C32_SUBMIT_TEXTURES || message.channel.id == settings.C64_SUBMIT_TEXTURES) 
		embed.setColor(colors.BLUE)
	else if (message.channel.id == settings.C32_SUBMIT_COUNCIL || message.channel.id == settings.C64_SUBMIT_COUNCIL) 
		embed.setColor(colors.COUNCIl)
	else if (message.channel.id == settings.C32_SUBMIT_REVOTE || message.channel.id == settings.C64_SUBMIT_REVOTE) 
		embed.setColor(colors.RED)

  if (embed.description !== null) embed.setDescription(message.embeds[0].description.replace(`[Original Post](${message.url})\n`, ''))

  await message.edit(embed)
}

async function changeStatus(message, string) {
  let embed = message.embeds[0]
  embed.fields[1].value = string
  await message.edit(embed)
}

async function removeReact(message, emojis) {
  for (let i = 0; emojis[i]; i++) {
    await message.reactions.cache.get(emojis[i]).remove()
    .catch(err => { if (process.DEBUG) console.error(`Can't remove emoji: ${emojis[i]}\n${err}`) })
  }
}

exports.editSubmission = editSubmission