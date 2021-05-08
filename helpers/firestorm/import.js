/* global process */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-constant-condition */
require('dotenv').config()
const { jsonModeration, jsonContributionsJava, jsonContributionsBedrock, jsonProfiles } = require('../fileHandler')

/**
 * @typedef {Object} User
 * @property {Number} userID
 * @property {String} username
 * @property {String[]} type
 * @property {Object} muted
 * @property {Number?} muted.start
 * @property {Number?} muted.end
 * @property {Number} timeout
 * @property {String[]} warns
 * @property {Function: Contributor?} contributor
 */

/**
 * @typedef {Object} Contributor
 * @property {Number} userID
 * @property {String} uuid
 * @property {Function} contributions
 */

/**
 * @typedef {Object} Contribution
 * @property {Number} id
 * @property {String} res
 * @property {String} date
 * @property {Number} textureID
 * @property {Number} contributorID
 * @property {String} res
 * @property {function(): Contributor[]} contributors
 */

/**
 * @typedef {Object} TextureUse
 * @property {Number} useID
 * @property {Number} id
 * @property {String} name
 */

/**
 * @typedef {Object} TexturePath
 * @property {Number} useID
 * @property {String} path
 * @property {String[]} versions
 * @property {String} edition
 * @property {function(): TextureUse} use
 */

/**
 * @typedef {Object} TextureAnimation
 * @property {Number} useID
 * @property {Object} mcmeta
 * @property {String} edition
 * @property {function(): TextureUse} uses
 */

/**
 * @typedef {Object} Texture
 * @property {Number} id
 * @property {function(): TextureUse[]} uses
 * @property {function(): TexturePath[]} paths
 * @property {function(): Contributor[]} contributors
 * @property {function(): Contribution[]} contributions
 * @property {function(): Contributor?} lastContributorID
 */

/** @type {Contribution[]} */
let all_contributions = []

/** @type {Contributor[]} */
let all_contributors = []

/** @type {User[]} */
let all_users = []

/** @type {Texture[]} */
let all_minecraft = []

/** @type {Texture[]} */
// eslint-disable-next-line no-unused-vars
let all_optifine = []

/** @type {TextureUse[]} */
let all_texture_uses = []

/** @type {TexturePath[]} */
let all_paths = []

/** @type {TextureAnimation[]} */
let all_animations = []

let textureID = 0
let textureUSEID = 0

let wasBuilt = false

// Create a new client
const all = require('./all')

const save = function() {
  return new Promise((resolve, reject) => {
    all.users.write_raw({})
    .then(() => 
    all.users.setBulk(Object.keys(all_users), Object.values(all_users)))
    .then(console.log)
    .catch(err => {
      console.error(err.response.data)
    })
  })
}

const build_from_files = async function() {
  if(wasBuilt)
    return module.exports

  if(process.env.DEBUG) console.log('Started build of database')

  const old_profiles = await jsonProfiles.read(false, false)
  // getting contributors done
  old_profiles.forEach(p => {
    /** @type {User} */
    const userID = parseInt(p.id)

    const u = {
      username: p.username,
      type: (Array.isArray(p.type)) ? p.type : ((typeof(p.type) === 'string') ? [p.type] : ['Member']),
    }

    if(p.uuid)
      u.uuid = p.uuid

    all_users["" + userID] = u
  })

  const old_moderation = await jsonModeration.read(false, false)
  old_moderation.forEach(m => {
    let u = all_users[m.user]

    if(!u) {
      u = {}
    }
    
    if(m.timeout)
      u.timeout = m.timeout
    if(m.muted)
      u.muted = m.muted
    if(m.warn)
      u.warns = m.warn

    if(Object.keys(u).length)
      all_users[m.user] = u
  })

  const javaContributions = await jsonContributionsJava.read(false, false)
  javaContributions.forEach(contrib => {
    let lastPath = undefined

    Object.keys(contrib.version).forEach(v => {
      if(contrib.version[v] !== lastPath) {
        /** @type {TexturePath} */
        const tp = {
          useID: textureUSEID,
          edition: 'java',
          path: contrib.version[v],
          versions: [v]
        }

        lastPath = tp.path

        all_paths.push(tp)
      } else {
        all_paths[all_paths.length - 1].versions.push(v)
      }
    })

    // add texture contributions
    const resss = ['c32', 'c64']
    resss.forEach(res => {
      if(!contrib[res] || !contrib[res].author)
        return
      
      // add contributions
      contrib[res].author.forEach(id => {
        /** @type {Contribution} */
        const myDate = (contrib[res].date || '01/01/2021').split('/')
        const time = new Date( myDate[2] || '1970', (myDate[1] - 1) || '0', (myDate[0] || '1')).getTime()

        const cb = {
          contributorID: parseInt(id),
          date: time,
          res: res,
          textureID: textureID
        }
        all_contributions.push(cb)
      })
    })

    // add bedrock texture
    if(contrib.isBedrock && contrib.bedrock) {
      let lastPath = undefined
      
      Object.keys(contrib.bedrock).forEach(v => {
        if(contrib.version[v] !== lastPath) {
          /** @type {TexturePath} */
          const tp = {
            useID: textureUSEID,
            edition: 'bedrock',
            path: contrib.version[v],
            versions: [v]
          }
  
          lastPath = tp.path
  
          all_paths.push(tp)
        } else {
          all_paths[all_paths.length - 1].versions.push(v)
        }
      })  
    }

    /** @type {TextureUse} */
    const tu = {
      textureID: textureID,
      textureUseName: "",
    }
    all_texture_uses["" + textureUSEID] = tu
    
    /** @type {Texture} */
    const tex = {
      name: ""
    }

    if(contrib.animated) {
      /** @type {TextureAnimation} */
      const anim = {
        mcmeta: contrib.mcmeta || {},
        edition: "java"
      }

      all_animations[textureUSEID] = anim
    }

    all_minecraft['' + textureID] = tex
    
    textureID++
    textureUSEID++
  })

  const bedrockContributions = await jsonContributionsBedrock.read(false, false)
  bedrockContributions.forEach(contrib => {
    let lastPath = undefined

    Object.keys(contrib.version).forEach(v => {
      if(contrib.version[v] !== lastPath) {
        /** @type {TexturePath} */
        const tp = {
          useID: textureUSEID,
          edition: 'bedrock',
          path: contrib.version[v],
          versions: [v]
        }

        lastPath = tp.path

        all_paths.push(tp)
      } else {
        all_paths[all_paths.length - 1].versions.push(v)
      }
    })

    /** @type {TextureUse} */
    const tu = {
      textureID: textureID,
      textureUseName: "",
    }
    all_texture_uses['' + textureUSEID] = tu
    
    /** @type {Texture} */
    const tex = {
      name: ''
    }

    all_minecraft['' + textureID] = tex

    if(contrib.animated) {
      /** @type {TextureAnimation} */
      const anim = {
        mcmeta: contrib.mcmeta || {},
        edition: "bedrock"
      }
      all_animations['' . textureUSEID] = anim
    }

    all_minecraft['' . textureID] = tex
    
    textureID++
    textureUSEID++
  })

  wasBuilt = true
  // if(process.env.DEBUG) console.log(module.exports)
  const res = await save()
  console.log(module.exports)
  if(process.env.DEBUG) console.log('Ended build of database')
}

build_from_files()

module.exports = {
  build: build_from_files,
  AllContributions: all_contributions,
  AllContributors: all_contributors,
  AllTexturesMinecraft: all_minecraft,
  AllTextureUses: all_texture_uses,
  AllUsers: all_users,
  AllPaths: all_paths,
  AllAnimations: all_animations,
  save: save
}