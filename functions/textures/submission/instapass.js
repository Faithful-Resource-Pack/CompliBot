const settings = require('../../../resources/settings.json')

const { downloadResults } = require("../admission/downloadResults")
const { warnUser } = require('../../../helpers/warnUser')

/**
 * Instapass a given texture embed
 * @param {DiscordClient} client discord client
 * @param {DiscordMessage} message embed to instapass
 * @returns
 */
async function instapass(client, message) {
  let channelOutID;
  let channelArray;

  for (let pack of Object.values(settings.submission.packs)) { // need a for loop here to get the pack name properly
    channelArray = Object.values(pack.channels);
    if (channelArray.includes(message.channel.id)) { // picks up both submit and council
      channelOutID = pack.channels.results
      break;
    }
  }

  const channelOut = await client.channels.fetch(channelOutID);

  if (!channelOut) return warnUser(message, "Result channel was not able to be fetched.");

  const sentMessage = await channelOut.send({
    embeds:
      [message.embeds[0]
        .setColor(settings.colors.yellow)
        .setDescription(`[Original Post](${message.url})\n${message.embeds[0].description ? message.embeds[0].description : ''}`)
      ]
  })

  await sentMessage.react(client.emojis.cache.get(emojiID))
  await downloadResults(client, channelOutID, true);
}

exports.instapass = instapass