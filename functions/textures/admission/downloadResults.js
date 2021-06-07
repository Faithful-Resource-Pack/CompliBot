const { getMessages } = require('../../../helpers/getMessages')

const emojis   = require('../../../ressources/emojis')
const settings = require('../../../ressources/settings')

const texturesCollection      = require('../../../helpers/firestorm/texture')
const contributionsCollection = require('../../../helpers/firestorm/contributions')

const fs = require('fs')
const fetch  = require('node-fetch')

/**
 * Download textures from the given text channel
 * @author Juknum
 * @param {DiscordClient} client
 * @param {String} channelInID discord text channel from where the bot should download texture
 */
async function downloadResults(client, channelInID) {
  let messages = await getMessages(client, channelInID)

  let res = 'c32'
  if (channelInID == settings.C64_RESULTS) res = 'c64'

  // select good messages
  messages = messages
    .filter(message => message.embeds.length > 0)
    .filter(message => message.embeds[0].fields[1] !== undefined && (message.embeds[0].fields[1].value.includes(`<:upvote:${emojis.UPVOTE}>`) || message.embeds[0].fields[1].value.includes(`<:upvote:${emojis.UPVOTE_OLD}>`) || message.embeds[0].fields[1].value.includes(`<:upvote:${emojis.INSTAPASS}>`) || message.embeds[0].fields[1].value.includes(`<:upvote:${emojis.INSTAPASS_OLD}>`) ))

  // map the array for easier management
  let textures = messages.map(message => {
    let texture = {
      url: message.embeds[0].image.url,
      authors: message.embeds[0].fields[0].value.split('\n').map(auth => auth.replace('<@!', '').replace('>', '')),
      date: message.createdTimestamp,
      id: message.embeds[0].title.split(' ').filter(el => el.charAt(0) === '[' && el.charAt(1) === '#' && el.slice(-1) == "]").map(el => el.slice(2, el.length - 1))[0]
    }
    return texture
  })

  // for each texture:
  let allContribution = []
  for (let i = 0; textures[i]; i++) {
    let textureID = textures[i].id
    let textureURL = textures[i].url
    let textureDate = textures[i].date
    let textureAuthors = textures[i].authors

    let texture = await texturesCollection.get(textureID)
    let uses    = await texture.uses()

    let allPaths = []
    // get all paths of the texture
    for (let j = 0; uses[j]; j++) {
      let localPath = './texturesPush'
      if (uses[j].editions[0] == 'java') localPath += '/Compliance-Java-'
      else if (uses[j].editions[0] == 'bedrock') localPath += '/Compliance-Bedrock-'
      else localPath += '/MISSING_REPOSITORY_TYPE'

      if (res == 'c32')      localPath += '32x'
      else if (res == 'c64') localPath += '64x'
      else                   localPath += 'MISSING_RES'

      let paths = await uses[j].paths()

      for (let k = 0; paths[k]; k++) {
        let versions = paths[k].versions
        for (let l = 0; versions[l]; l++) {

          if (versions[l] != '1.16.200') { // HARD FIX: TODO: REMOVE 1.16.200 OCCURENCE FROM THE DB
            if (uses[j].editions[0] == 'java') allPaths.push(localPath + '/' + versions[l] + '/assets/' + paths[k].path)
            else allPaths.push(localPath + '/' + versions[l] + '/' + paths[k].path)
          }
        }
      }
    }

    const response = await fetch(textureURL)
    const buffer   = await response.buffer()

    // download the texture to all it's paths
    for (let j = 0; allPaths[j]; j++) {
      // create full folder path
      await fs.promises.mkdir(allPaths[j].substr(0, allPaths[j].lastIndexOf('/')), { recursive: true })
        .catch(err => { if (process.DEBUG) console.error(err) })
      // write texture to the corresponding path
      fs.writeFile(allPaths[j], buffer, function (err) {
        if (err && process.DEBUG) return console.error(err)
        else if (process.DEBUG) return console.log(`ADDED TO: ${allPaths[j]}`)
      })
    }

    // prepare the authors for the texture:
    allContribution.push({
      date: textureDate,
      res: res,
      textureID: parseInt(textureID, 10),
      contributors: textureAuthors
    })
  }

  let result = await contributionsCollection.addBulk(allContribution)
  if (process.DEBUG) console.log('ADDED CONTRIBUTIONS: ' + result.join(' '))
}

exports.downloadResults = downloadResults