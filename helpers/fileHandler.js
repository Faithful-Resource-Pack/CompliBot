/*eslint no-undef: "error" */
/*eslint-env node*/

/**
 * @brief File made to safely handle files and json more particularly.
 * Goal is to have dynamic paths
 */
const fs = require('fs')
const os = require('os')
const { exec, execSync } = require('child_process')
const { dirname, normalize, join } = require('path')
const { Mutex } = require('async-mutex')
require('dotenv').config()

const JSON_WRITE_SPACES = 2
const JSON_WRITE_REPLACER = null

// default values because I am fed up to always set try catches everywhere, unknow paths and I want dynamic paths
const JSON_DEFAULT_MODERATION = []
const JSON_PATH_MODERATION = './json/moderation.json'

const JSON_DEFAULT_CONTRIBUTIONS = []
const JSON_PATH_CONTRIBUTIONS_JAVA = './json/contributors/java.json'
const JSON_PATH_CONTRIBUTIONS_BEDROCK = './json/contributors/bedrock.json'

const JSON_PATH_PROFILES = './json/profiles.json'
const JSON_DEFAULT_PROFILES = []

const OUT_NULL = os.platform() == 'win32' ? 'NUL' : '/dev/null'

/* eslint-disable no-empty */
function __prep() {
  try {
    // remove everything
    execSync("cd json && rm -rf .git/") // delete git
    execSync("cd json && git init") // restart fresh

    // add origin
    execSync("cd json && git remote add origin https://" + process.env.COMPLIBOT_GIT_USERNAME + ":" + process.env.COMPLIBOT_GIT_TOKEN + "@github.com" + process.env.COMPLIBOT_GIT_JSON_REPO)
    
    // set username and email
    execSync(`cd json && git config user.name "${process.env.COMPLIBOT_GIT_USERNAME}"`)
    execSync(`cd json && git config user.name "${process.env.COMPLIBOT_GIT_EMAIL}"`)
  } catch (__ignored) {}
}

class FileHandler {
  /**
   *
   * @param {String} filepath Path to the file from here
   * @param {String} defaultValue default parsed value
   * @param {Boolean} isJson Auto parse value if JSON
   * @param {Boolean} pull Pulling last version before modification
   */
  constructor(filepath, defaultValue = '', isJson = true, pull = true) {
    this.filepath = filepath
    this.isJson = isJson
    this.defaultValue = defaultValue

    // time to go serious with mutex locks
    // if you are curious https://www.youtube.com/watch?v=9lAuS6jsDgE
    this.mutex = new Mutex()
    this._release = undefined
    this.doPull = pull
  }

  /**
   * Pulls file
   * @returns {Promise}
   */
  pull() {
    return new Promise((resolve, reject) => {
      __prep()

      let cmd = ""
      cmd += "cd json"
      cmd +=" && git fetch --all"
      cmd +=" && git checkout origin/main -- " + this.filepath.replace('json/', '')
      
      exec(cmd, (error, stdout, stderr) => {
        if(error) {
          reject({
            error: error,
            stderr: stderr,
            stdout: stdout
          })
        }
        
        resolve(stdout)
      })
    })
  }
  
  /**
   * Add file
   * @returns {Promise}
   */
  add() {
    return new Promise((resolve, reject) => {
      let cmd = ""
      cmd += `cd json`
      cmd +=" && git add " + this.filepath.replace('json/', '')
      
      exec(cmd, (error, stdout, stderr) => {
        if(error) {
          reject({
            error: error,
            stderr: stderr,
            stdout: stdout
          })
        }

        resolve(stdout)
      })
    })
  }

  /**
   * Commits changes
   * @param {String} message Commit message
   * @returns {Promise}
   */
  commit(message = 'AutoCommit made by FileHandler') {
    return new Promise((resolve, reject) => {
      let cmd = ""
      cmd += `cd json`
      cmd +=" && git config user.name " + process.env.COMPLIBOT_GIT_USERNAME
      cmd +=" && git config user.email " + process.env.COMPLIBOT_GIT_EMAIL
      cmd +=` && git commit -m "${ message }" 2>${ OUT_NULL }`

      exec(cmd, (error, stdout, stderr) => {
        if(error) {
          reject({
            error: error,
            stderr: stderr,
            stdout: stdout
          })
        }

        resolve(stdout)
      })
    })
  }

  /**
   * Pushes repo
   * @returns {Promise}
   */
  push() {
    return new Promise((resolve, reject) => {
      let cmd = ""
      cmd += "cd json"
      cmd +=" && git remote remove origin"

      try {
        execSync(cmd)
      } catch (_ignored) {
        // ignored
      }

      cmd = ""
      cmd += `cd json`
      cmd +=" && git remote add origin https://" + process.env.COMPLIBOT_GIT_USERNAME + ":" + process.env.COMPLIBOT_GIT_TOKEN + "@github.com" + process.env.COMPLIBOT_GIT_JSON_REPO
      cmd +=" && git push origin main"
      
      exec(cmd, (error, stdout, stderr) => {
        if(error) {
          reject({
            error: error,
            stderr: stderr,
            stdout: stdout
          })
        }

        resolve(stdout)
      })
    })
  }

  release() {
    if(this._release !== undefined) {
      this._release()
      this._release = undefined
    }
  }

  read(lock = true, doThePull = true) {
    return new Promise((resolve, reject) => {
      if(!lock) {
        // if no lock, go on, take the file and get out
        try {
          let res = fs.readFileSync(this.filepath)
          
          if(this.isJson) res = JSON.parse(res)

          resolve(res)
        } catch (error) {
          // if no file found, give default
          if(error.code === 'ENOENT') {
            resolve(this.defaultValue)
          } else {
            console.error(error)
            reject(error)
          }
        }

        return
      }

      // else we will have a problem

      // the mutex is a lock and you need to acquire it to be authorized to do an action
      let real = undefined
      let promise = this.mutex.acquire().then(release => {
        real = release
      }).catch((err) => console.error(err))

      if(this.doPull && doThePull) {
        promise = promise.then(() => {
          return this.pull()
        })
        .catch((err) => {
          console.error(err)
        })
      }

      promise.then(() => {
        // wow you have the lock, now get the file, release and get out
        try {
          let res = fs.readFileSync(this.filepath)
          
          if(this.isJson) res = JSON.parse(res)

          // yeah yeah store the release function
          this._release = real
          resolve(res)
        } catch (error) {
          // if no file found, give default
          if(error.code === 'ENOENT') {
            resolve(this.defaultValue)
          } else {
            console.error(error)

            // if there is a real error, release it then and reject
            this.release()
            reject(error) 
          }
        }
      })
      .catch((err) => {
        // should never, never happend, but we don't know
        reject(err)
      })
    })
  }

  write(content) {
    // create the folders recusively if not existing
    fs.mkdirSync(dirname(this.filepath), { recursive: true })

    // this content is transformed in JSON if needed
    if(content !== 'string' && this.isJson)
      content = JSON.stringify(content, JSON_WRITE_REPLACER, JSON_WRITE_SPACES)

    return new Promise((resolve, reject) => {
      try {
        fs.writeFileSync(join(process.cwd(), normalize(this.filepath)), content, { flag: 'w' })

        // write and release
        this.release()
        resolve()
      } catch (error) {
        this.release()
        reject(error)
      }
    })
  }
}

module.exports = {
  FileHandler : FileHandler,

  jsonContributionsBedrock: new FileHandler(JSON_PATH_CONTRIBUTIONS_BEDROCK, JSON_DEFAULT_CONTRIBUTIONS),
  jsonContributionsJava: new FileHandler(JSON_PATH_CONTRIBUTIONS_JAVA, JSON_DEFAULT_CONTRIBUTIONS),
  jsonModeration: new FileHandler(JSON_PATH_MODERATION, JSON_DEFAULT_MODERATION, true, false),
  jsonProfiles: new FileHandler(JSON_PATH_PROFILES, JSON_DEFAULT_PROFILES)
}