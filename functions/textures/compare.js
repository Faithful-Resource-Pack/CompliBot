const Discord = require('discord.js')
const strings = require("../../resources/strings")
const textures = require('../../helpers/firestorm/texture')
const FindTexture = require('../../functions/textures/findTexture')
const choiceEmbed = require('../../helpers/choiceEmbed')
const { addDeleteReact } = require('../../helpers/addDeleteReact')
const { ID_FIELD } = require('../../helpers/firestorm')

/**
* @typedef {Object} CompareOption
* @property {(number|String)?} id Id of the texture to get
* @property {String?} search Search terms
* @property {String[]?} resolutions Resolutions wanted, all if undefined
* @property {number?} scale Output scale, 1 by default
* @property {String[]?} images Additional image array
* @property {Discord.Message?} response Message to respond to
* @property {Discord.User?} user User to respond to
*/

const RES_SIDE = [16, 32, 64]
const RES_JAVA = 'j'
const RES_BEDROCK = 'b'
const EDITIONS_ALLOWED = [RES_JAVA, RES_BEDROCK]
const RES_ALLOWED = EDITIONS_ALLOWED.map(e => RES_SIDE.map(el => el + e)).flat()

const SCALE_MIN = 1
const SCALE_MAX = 10
const SCALE_DEFAULT = SCALE_MIN

/**
 * @type {CompareOption}
 */
const COMPARE_DEFAULT = {
  search: undefined,
  id: undefined,
  resolutions: RES_ALLOWED.slice(0, RES_ALLOWED.length / 2),
  scale: SCALE_DEFAULT,
  images: [],
  response: undefined,
  user: undefined
}

/**
 * Gives image as result with comparaison input data
 * @param {CompareOption} compareOptions Select options
 * @return {Promise<void>} Sends result to target
 */
module.exports = function (compareOptions) {
  // applying default options
  compareOptions = Object.assign({}, COMPARE_DEFAULT, compareOptions)

  // PANIC if both search and id
  if (compareOptions.search !== undefined && compareOptions.id !== undefined)
    return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nYou can't compare an Id and a search term`))

  // search check
  if (compareOptions.search !== undefined) {
    if (typeof compareOptions.search !== 'string') {
      return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nSearch term must be a string`))
    } else {
      compareOptions.search = compareOptions.search.trim()
    }
  }

  if (compareOptions.id !== undefined) {
    if (typeof compareOptions.id !== 'string' && typeof compareOptions.id !== 'number')
      return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nID must be a string or a number`))

    if (typeof compareOptions.id === 'string') {
      // clean string
      compareOptions.id = compareOptions.id.trim()
      if (compareOptions.id.length >= 3 && compareOptions.id[0] === "[" && compareOptions.id[1] === "#" && compareOptions.id[compareOptions.length - 1] === "]") {
        compareOptions.id = compareOptions.id.substring(2, compareOptions.id.length - 1)
      }

      // parse to int
      compareOptions.id = parseInt(compareOptions.id)

      // PANIC if not a number
      if (isNaN(compareOptions.id)) {
        return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nID string must be a correct id or a number`))
      }
    }
  }

  // check if and what incorrect res
  // also we determine minecraft edition search
  let correctRes = true
  let incorrectRes
  let askedForJava = false
  let askedForBedrock = false
  if (compareOptions.resolutions === undefined) {
    compareOptions.resolutions = RES_ALLOWED
    askedForJava = true
    askedForBedrock = true
  } else {
    let resIndex = 0
    while (resIndex < compareOptions.resolutions.length && correctRes) {
      const possibleRes = compareOptions.resolutions[resIndex]
      if (!RES_ALLOWED.includes(possibleRes)) { // includes matches type too so no need
        correctRes = false
        incorrectRes = compareOptions.resolutions[resIndex]
      } else {
        if (possibleRes.endsWith(RES_JAVA)) askedForJava = true
        if (possibleRes.endsWith(RES_BEDROCK)) askedForBedrock = true
      }
      ++resIndex
    }
  }
  // reject if so
  if (!correctRes) {
    return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nIncorrect resolution : ${incorrectRes}`))
  }

  if (!askedForJava && !askedForBedrock) {
    // do not panic and say "You should at least ask for java or bedrock"
    // select both
    askedForBedrock = true
    askedForJava = true
  }

  // replace default value to scale else limit it
  if (compareOptions.scale === undefined || typeof (compareOptions.scale) !== 'number') {
    compareOptions.scale = 1
  } else {
    compareOptions.scale = Math.min(Math.max(Math.round(compareOptions.scale), SCALE_MIN), SCALE_MAX)
  }

  // check additional images order
  if (compareOptions.images !== undefined && Array.isArray(compareOptions.images)) {
    let correctType = true
    let imageIndex = 0
    while (imageIndex < compareOptions.images.length && correctType) {
      correctType = typeof compareOptions.images[imageIndex] === 'string'
      ++imageIndex
    }

    if (!correctType) {
      return Promise.reject(new Error(`${string('command.args.invalid.generic')}\n Images must be a string array`))
    }
  } else {
    return Promise.reject(new Error(`${string('command.args.invalid.generic')}\n Images must an array`))
  }

  // using ! to check for null-like value
  if (!compareOptions.response && !compareOptions.user) {
    return Promise.reject(new Error(`${string('command.args.invalid.generic')}\n You must provide a user or a message to respond to`))
  }

  // user not null-like
  if (!compareOptions.response) {
    // we have a user
    // now check if method available
    // https://discord.js.org/#/docs/main/stable/class/User?scrollTo=send
    if (compareOptions.user.send === undefined) {
      return Promise.reject(new Error(`${string('command.args.invalid.generic')}\n user must be a User`))
    }
    compareOptions.response = undefined // ease for next use
  } else {
    // we have a message
    // now check if method available
    // https://discord.js.org/#/docs/main/stable/class/Message?scrollTo=reply
    if (compareOptions.response.reply === undefined) {
      return Promise.reject(new Error(`${string('command.args.invalid.generic')}\n response must be a Message`))
    }
    compareOptions.user = undefined // ease for next use
  }

  // exclusive between id and search
  const idSearch = compareOptions.id !== undefined

  // search in correct file
  let findPromise = idSearch ? textures.get(compareOptions.id) : FindTexture.find(compareOptions.search)

  /** @type {textures.Texture[]} */
  let resultsFound
  let finalTextureChosen
  return findPromise
    .catch(err => {
      // you may not find it, it happens
      if (process.env.DEBUG) console.error(err)
      return undefined
    })
    .then(results => {
      // put as array
      if (idSearch) results = results !== undefined ? [results] : []

      // check no results
      if (results === undefined || results.length === 0) {
        return Promise.reject(new Error(`${string('command.texture.does_not_exist')}\nCouldn't find results`))
      }

      return Promise.resolve(results)
    })
    .then(async (results) => {
      resultsFound = results
      if (resultsFound.length > 1) {
        // get all the paths for the texture
        const uses = await Promise.all(results.map(tex => tex.uses()))
        const paths = await Promise.all(uses.map(u => u.length > 0 ? u[0].paths() : Promise.resolve([])))
        const latestPaths = paths.map(p => {
          // for all paths, sort them b
          let latestVersion = undefined
          let latestPath = undefined
          let bestVersion
          p.forEach((a) => {
            bestVersion = a.versions.sort(MinecraftSorter).reverse()[0]
            if (latestVersion === undefined || MinecraftSorter(latestVersion, bestVersion) <= 0) {
              latestVersion = bestVersion
              latestPath = a
            }

            return latestPath
          })

          return latestPath
        }).map(p => p.path)
        return choiceEmbed(compareOptions.response, {
          title: `Select texture for search: '${compareOptions.search}'`,
          footer: `ChoiceEmbed`,
          propositions: latestPaths
        }, compareOptions.user)
          .then(res => res.index)
      }
      return Promise.resolve(0) // choose first one
    })
    .then(choiceIndex => {
      if (choiceIndex === undefined || (typeof choiceIndex !== 'string' && typeof choiceIndex !== 'number')) {
        return Promise.reject(new Error(`${string('command.args.invalid.generic')}\nIncorrect idnex : ${choiceIndex}`))
      }

      /** @type {textures.Texture} */
      finalTextureChosen = resultsFound[choiceIndex]

      // return all uses
      return finalTextureChosen.uses()
    })
    .then(uses => {
      let javaUse = undefined
      let bedrockUse = undefined
      let useIndex = 0
      while (useIndex < uses.length && (askedForJava && javaUse === undefined || askedForBedrock && bedrockUse === undefined)) {
        const use = uses[useIndex]
        if (askedForJava && javaUse === undefined && use.editions.includes('java')) javaUse = use
        else if (askedForBedrock && bedrockUse === undefined && use.editions.includes('bedrock')) bedrockUse = use
        ++useIndex
      }

      /** @type {import("../../helpers/firestorm/texture_use").TextureUse[]} */
      const selectedUses = [javaUse, bedrockUse]

      return Promise.all(selectedUses.map(use => use !== undefined ? use.paths() : Promise.resolve(undefined)))
    })
    /** @param {import("../../helpers/firestorm/texture_paths").TexturePath[]} ppaths */
    .then(ppaths => {
      // supposed to be a 2-long array
      let urls = []
      const javaPaths = ppaths[0]
      const bedrockPaths = ppaths[1]

      if (javaPaths !== undefined) urls = [...urls, ...compareOptions.resolutions.filter(res => res.endsWith(RES_JAVA)).map(res => FindTexture.pathToTextureURL(javaPaths[0].path, 'java', parseInt(res)))]
      if (bedrockPaths !== undefined) urls = [...urls, ...compareOptions.resolutions.filter(res => res.endsWith(RES_BEDROCK)).map(res => FindTexture.pathToTextureURL(bedrockPaths[0].path, 'bedrock', parseInt(res)))]

      return Promise.resolve(urls)
    })
    .then(urls => {
      const CanvasDrawer = require('../../functions/textures/canvas')
      const drawer = new CanvasDrawer()

      drawer.scale = compareOptions.scale
      drawer.urls = urls

      // put 16 first and then increasing res and then yours
      drawer.order = compareOptions.resolutions.sort().map((_el, index) => index)

      // unlimited attachments
      if (compareOptions.images.length > 0) {
        let orderSize = drawer.order.length

        compareOptions.images.forEach(imageUrl => {
          drawer.urls.push(imageUrl)
          drawer.order.push(orderSize)
          ++orderSize
        })
      }

      // load images and draw
      return drawer.draw()
    })
    .then(bufferResult => {
      const attachment = new Discord.MessageAttachment(bufferResult, 'output.png')
      const messageOptions = { files: [attachment] }
      const messageTitle = `\`\`[#${finalTextureChosen[ID_FIELD]}]\`\` ${finalTextureChosen.name}`
      const sendPromise = compareOptions.response !== undefined ? compareOptions.response.reply(messageTitle) : compareOptions.user.send(messageTitle)
      const resultPromise = sendPromise.then(embedMessage => {
        addDeleteReact(embedMessage, messageOptions.message, true)
        return embedMessage
      }).then(m => {
        m.edit(messageOptions)
        return m
      })
      return resultPromise
    })
}

// eslint-disable-next-line no-unused-vars
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