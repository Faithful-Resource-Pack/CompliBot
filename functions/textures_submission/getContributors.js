/*eslint-env node*/
const settings = require('../../ressources/settings.js')
const strings  = require('../../ressources/strings.js')

const { date }        = require('../utility/date.js')
const { getMessages } = require('../getMessages.js')
const { githubPush }    = require('../githubPush.js')
const { jsonContributionsBedrock, jsonContributionsJava } = require('../../helpers/fileHandler.js')

async function getContributors(client, inputID) {
  const messages = await getMessages(client, inputID, 10)
  
  console.log(messages.length)

  let textures  = undefined
  let texturesB = undefined
  let folder    = undefined
  let search    = undefined

  let textureIndex    = -1
  let textureName     = undefined
  let texturePath     = undefined
  let textureSize     = undefined
  let textureType     = undefined
  let textureAuthor   = undefined
  let textureCoAuthor = []

  var contributionsJava    = []
  var contributionsBedrock = []

  /* looks like:
  contribution : [
    {
      index: 0,
      size: 32, // 64
      author: '12142103912039',
      coauthors: [ '204910302929203', '23029201031294' ]
    },
    {
      ...
    }
  ]
  */

  jsonContributionsBedrock.pull()
  jsonContributionsJava.pull()

  for (const message of messages) {
    if (message.embeds[0] && message.embeds[0].color == 5025616) {
      // reset previous iteration
      textureCoAuthor = []
      textureIndex    = -1
      textureSize     = undefined

      textureName = message.embeds[0].fields[0].value.replace('.png', '') + '.png' || null
      texturePath = message.embeds[0].fields[1].value || null
      textureType = message.embeds[0].fields[2].value || null

      try {
        textureAuthor = `${client.users.cache.find(u => u.tag === `${message.embeds[0].author.name}`).id}` || undefined
      } catch (error) {
        console.log(`Can't find this user: ${message.embeds[0].author.name}`)
      }

      if (message.embeds[0].fields[3]) {
        let words = message.embeds[0].fields[3].value.split(' ')
        for (let k = 0; k < words.length; k++) {
          let id = await getUserIDFromMention(words[k])
          if (id) textureCoAuthor.push(id)
        }
      }

      if (textureType == 'java') {
        textures = await jsonContributionsJava.read(true, false)

        if (texturePath.includes('realms')) {
          folder = texturePath.replace('realms/textures/', '')
          search = `realms/textures/${folder}/${textureName}`
        }
        else {
          folder = texturePath.replace('minecraft/textures/', '')
          search = `minecraft/textures/${folder}/${textureName}`
        }

        for (let l = 0; l < textures.length; l++) {
          if (textures[l].version[strings.LATEST_MC_JE_VERSION].includes(search)) {
            textureIndex = l

            if (inputID == settings.C32_RESULTS) textureSize = 32
            else if (inputID == settings.C64_RESULTS) textureSize = 64
            
            contributionsJava.push({
              index:     textureIndex,
              size:      textureSize,
              author:    textureAuthor,
              coauthors: textureCoAuthor
            })

            break
          }
        }

        // if texture is also in bedrock:
        if (textureIndex != -1 && textures[textureIndex].isBedrock) {
          texturesB = await jsonContributionsBedrock.read(true, false)
          search    = textures[textureIndex].bedrock[strings.LATEST_MC_BE_VERSION]
          
          for (let b = 0; b < texturesB.length; b++) {
            if (texturesB[b].version[strings.LATEST_MC_BE_VERSION].includes(search)) {

              contributionsBedrock.push({
                index:     b,
                size:      textureSize,
                author:    textureAuthor,
                coauthors: textureCoAuthor
              })

              break
            }
          }

          jsonContributionsBedrock.release()
        }

        jsonContributionsJava.release()

      }
      else if (textureType == 'bedrock') {
        textures = await jsonContributionsBedrock.read()

        folder = texturePath.replace('textures/', '')
        search = `textures/${folder}/${textureName}`

        for (let l = 0; l < textures.length; l++) {
          if (textures[l].version[strings.LATEST_MC_BE_VERSION].includes(search)) {
            textureIndex = l

            if (inputID == settings.C32_RESULTS) textureSize = 32
            else if (inputID == settings.C64_RESULTS) textureSize = 64
            
            contributionsBedrock.push({
              index:     textureIndex,
              size:      textureSize,
              author:    textureAuthor,
              coauthors: textureCoAuthor
            })

            break
          }
        }

        jsonContributionsBedrock.release()
      }
    }
  }

  setContributors(contributionsJava, contributionsBedrock)
}

async function setContributors(java, bedrock) {
  let texturesJava    = await jsonContributionsJava.read(true, false)
  let texturesBedrock = await jsonContributionsBedrock.read(true, false)

  for (const item of java) {
    if (item.coauthors != [] && !item.coauthors.includes(item.author)) item.coauthors.push(item.author)

    if (item.size == 32) {
      texturesJava[item.index].c32.date   = date()
      texturesJava[item.index].c32.author = item.coauthors
    }
    else if (item.size == 64) {
      texturesJava[item.index].c64.date   = date()
      texturesJava[item.index].c64.author = item.coauthors
    }
  }

  for (const item of bedrock) {
    if (item.coauthors != [] && !item.coauthors.includes(item.author)) item.coauthors.push(item.author)

    if (item.size == 32) {
      texturesBedrock[item.index].c32.date   = date()
      texturesBedrock[item.index].c32.author = item.coauthors
    }
    else if (item.size == 64) {
      texturesBedrock[item.index].c64.date   = date()
      texturesBedrock[item.index].c64.author = item.coauthors
    }
  }

  await jsonContributionsJava.write(texturesJava)
  await jsonContributionsBedrock.write(texturesBedrock)

  jsonContributionsJava.release()
  jsonContributionsBedrock.release()

  githubPush('Compliance-Resource-Pack', 'JSON', 'main', `(WIP) githubPush passed textures from ${date()}`, './json/')
}

async function getUserIDFromMention(mention) {
  if (!mention) return
  if (mention.startsWith('<@') && mention.endsWith('>')) {
    mention = mention.slice(2, -1)
    if (mention.startsWith('!')) mention = mention.slice(1)
    return mention
  }
}

exports.getContributors = getContributors