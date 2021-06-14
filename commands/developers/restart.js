const prefix  = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const DEVELOPER_IDs = [uidR, uidJ, uidD, uidT]

const strings = require('../../ressources/strings')
const colors  = require('../../ressources/colors')

const { warnUser } = require('../../helpers/warnUser')

const Discord = require('discord.js')
const { writeFile } = require('fs').promises
const { exec } = require('child_process')
const { join } = require('path')
const spawn = require('cross-spawn')

/**
 * @param {string} command Command to spawn
 * @param {child_process.SpawnOptionsWithoutStdio} args  args to the command
 * @param {child_process.SpawnOptionsWithStdioTuple} options STDIO options
 * @returns {Promise} Whether command went well or not
 */
const spawnPromise = function(command, args) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, {
      detached: true
    })

    cmd.unref()

    const out = []
    const err = []

    cmd.stdout.on('data', data => {
      out.push(data)
      console.log(`stdout: ${data}`);
    })
    
    cmd.stderr.on('data', data => {
      err.push(data)
      console.error(`stderr: ${data}`)
    })

    cmd.on('close', code => {
      if(code == 0)
        resolve(out.join('\n'))
      else
        reject(err.join('\n'))
    })
  })
}

function execPromise(cmd) {
  return new Promise((resolve) => {
   exec(cmd, (error, stdout, stderr) => {
    if (error) {
     console.warn(error);
    }
    resolve(stdout? stdout : stderr);
   });
  });
 }

module.exports = {
	name: 'restart',
	description: strings.HELP_DESC_RESTART,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}restart`,
	example: `${prefix}restart`,
	args: true,
  /**
   * Pulls, and reloads the bot
   * @param {Discord.Client} client Discord Client receiving the message
   * @param {Discord.Message} message Incomming message
   * @param {String[]} _args command args
   */
	// eslint-disable-next-line no-unused-vars
	async execute(client, message, args) {
    if(!DEVELOPER_IDs.includes(message.author.id)) {
      const emb = new Discord.MessageEmbed()
        .setTitle(':no_entry: Access denied :no_entry:')
        .setColor(colors.RED)
        .setDescription('You are not allowed to use this command')

      const err = await message.channel.send(emb)

      setTimeout(() => {
        message.delete()
        err.delete()
      }, 7000);
      return
    }

    const emb = new Discord.MessageEmbed()
      .setTitle(':white_check_mark: Access granted :white_check_mark:')
      .setColor(colors.GREEN)
      .setDescription('Welcome sir')

    // sending embed
    // deleting our message
    // changing status 
    const results = await Promise.all([message.channel.send(emb), client.user.setPresence({ activity: { name: 'Updating...' }, status: 'idle' })])

    const result = results[0]

    console.warn(process.pid)

    writeFile(join(process.cwd(), 'json', 'restart_message.txt'), [result.channel.guild.id, result.channel.id, result.id].join('\n'))
      .then(() => {
        emb.addField('Git', 'Pulling changes...', false)
        return result.edit(emb)
      })
      .then(() => {
        return spawnPromise('git', ['pull'])
      })
      .then(() => {
        emb.addField('NPM', 'Installing dependencies...', false)
        return result.edit(emb)
      })
      .then(async () => {
        await execPromise('npm i --save')

        return Promise.resolve()
      })
      .then(() => {
        console.log('deleting message');
        return message.delete()
      })
      .then(() => {
        console.log('restart message');
        emb.addField('Restart', 'Restarting bot...', false)
        return result.edit(emb)
      })
      .then(() => {
        let string_command
        if(process.platform == 'win32') {
          string_command = `start.bat` // windows 
          console.log("restarting ...", string_command)
          return spawnPromise(string_command, [])
        }
        else {
          string_command = `./start.sh ${ process.pid }`
          console.log("restarting ...", string_command)
          return execPromise(string_command)
        }
      })
      .then(out => {
        console.log(out)
      })
      .catch(async (err) => {
        console.trace('error in restart command"', err, '"')
        await warnUser(message, err.toString())
        return await result.delete()
      })
  }
}