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

let contributionID = 0
let textureID = 0
let textureUSEID = 0

let wasBuilt = false

// Create a new client
const firestore = require('./database')
const save = async function() {
  const writePromises = all_animations.map(obj => JSON.parse(JSON.stringify(obj))).map(obj => {
    return firestore.collection("animations").doc("" + obj.useID).set(obj)
  })

  Promise.all(writePromises)
}

const build_from_files = async function() {
  if(wasBuilt)
    return module.exports

  if(process.env.DEBUG) console.log('Started build of database')

  const old_profiles = await jsonProfiles.read(false, false)
  // getting contributors done
  old_profiles.forEach(p => {
    /** @type {User} */
    const u = {
      id: parseInt(p.id),
      username: p.username,
      type: (Array.isArray(p.type)) ? p.type : ((typeof(p.type) === 'string') ? [p.type] : ['Member']),
      muted: {},
      timeout: 0,
      warns: [],
    }

    all_users.push(u)

    /** @type {Contributor} */
    const c = {
      userID: parseInt(p.id),
      username: p.username,
      uuid: p.uuid,
      contributions: function() {
        return all_contributions.filter(contrib => this.userID === contrib.contributorID)
      }
    }
    all_contributors.push(c)
  })

  const old_moderation = await jsonModeration.read(false, false)
  old_moderation.forEach(m => {
    let u = all_users.filter(u => u.id === parseInt(m.user))[0]
    if(!u) {
      u = {
        id: parseInt(m.user)
      }
  
      all_users.push(u)
    }
    
    if(m.timeout)
      u.timeout = m.timeout
    if(u.warns)
      u.warns = m.warn

    all_users.push(u)
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
          versions: [v],
          use: function() {
            return all_texture_uses.filter(u => u.useID === textureUSEID)[0]
          }
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
        const cb = {
          contributorID: id,
          date: contrib[res].date || '',
          id: contributionID++,
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
            versions: [v],
            use: function() {
              return all_texture_uses.filter(u => u.useID === textureUSEID)[0]
            }
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
      useID: textureUSEID,
      id: textureID,
      name: "",
    }
    all_texture_uses.push(tu)
    
    /** @type {Texture} */
    const tex = {
      id: textureID,
      uses: function() {
        return all_texture_uses.sort(u => u.id === this.id)
      },
      paths: function(fil = el => el) {
        const useIDs = this.uses().map(u => u.useID)
        return all_paths.filter(pa => useIDs.includes(pa.useID)).filter(fil)
      },
      contributions: function(fil = el => el) {
        return all_contributions.filter(ctr => ctr.textureID === this.id).filter(fil)
      },
      lastContributorID: function () {
        return this.contributions().sort((a, b) => a.date > b.date ? -1 : +(a.date < a.date))[0]
      },
      contributors: function(fil = el => el) {
        return [].concat.apply([], this.contributions().map(ctr => ctr.contributors())).filter(fil)
      }
    }

    if(contrib.animated) {
      /** @type {TextureAnimation} */
      const anim = {
        useID: textureUSEID,
        mcmeta: contrib.mcmeta,
        edition: "java"
      }
      all_animations.push(anim)
    }

    all_minecraft.push(tex)
    
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
          versions: [v],
          use: function() {
            return all_texture_uses.filter(u => u.useID === textureUSEID)[0]
          }
        }

        lastPath = tp.path

        all_paths.push(tp)
      } else {
        all_paths[all_paths.length - 1].versions.push(v)
      }
    })

    /** @type {TextureUse} */
    const tu = {
      useID: textureUSEID,
      id: textureID,
      name: "",
    }
    all_texture_uses.push(tu)
    
    /** @type {Texture} */
    const tex = {
      id: textureID,
      uses: function() {
        return all_texture_uses.sort(u => u.id === this.id)
      },
      paths: function(fil = el => el) {
        const useIDs = this.uses().map(u => u.useID)
        return all_paths.filter(pa => useIDs.includes(pa.useID)).filter(fil)
      },
      contributions: function(fil = el => el) {
        return all_contributions.filter(ctr => ctr.textureID === this.id).filter(fil)
      },
      lastContributorID: function () {
        return this.contributions().sort((a, b) => a.date > b.date ? -1 : +(a.date < a.date))[0]
      },
      contributors: function(fil = el => el) {
        return [].concat.apply([], this.contributions().map(ctr => ctr.contributors())).filter(fil)
      }
    }

    if(contrib.animated) {
      /** @type {TextureAnimation} */
      const anim = {
        useID: textureUSEID,
        mcmeta: contrib.mcmeta,
        edition: "bedrock"
      }
      all_animations.push(anim)
    }

    all_minecraft.push(tex)
    
    textureID++
    textureUSEID++
  })

  all_users.forEach(u => {
    u.contributor = function() {
      return all_contributors.filter(c => this.userID == c.userID)[0]
    }
  })

  wasBuilt = true
  // if(process.env.DEBUG) console.log(module.exports)
  const res = await save()
  console.log(res)
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