const prefix  = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const DEVELOPER_IDs = [uidR, uidJ, uidD, uidT]

const strings = require('../../ressources/strings')

const { warnUser } = require('../../helpers/warnUser')

const Discord = require('discord.js')
const { writeFile } = require('fs/promises')
const child_process = require('child_process')
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
    const cmd = spawn(command, args)

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
   * @param {String[]} args command args
   */
	async execute(client, message, args) {
    if(!DEVELOPER_IDs.includes(message.author.id)) {
      const emb = new Discord.MessageEmbed()
        .setTitle(':no_entry: Access denied :no_entry:')
        .setColor('0xba1930')
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
      .setColor('0x10ff0d')
      .setDescription('Welcome sir')

    // sending embed
    // deleting our message
    // changing status 
    const results = await Promise.all([message.channel.send(emb), client.user.setPresence({ status: 'idle' })])

    const result = results[0]

    writeFile(join(process.cwd(), 'json', 'restart_message.txt'), [result.channel.guild.id, result.channel.id, result.id].join('\n'))
      .then(() => {
        emb.addField('Git', 'Pulling changes...', false)
        return result.edit(emb)
      })
      .then(() => {
        return spawnPromise('git', ['pull'])
      })
      .then(() => {
        return message.delete()
      })
      .then(() => {
        emb.addField('Restart', 'Restarting bot...', false)
        return result.edit(emb)
      })
      .then(() => {
        return spawnPromise(process.argv[0], process.argv.slice(1))
      })
      .catch(async (err) => {
        console.error('error in restart command', err)
        await warnUser(message, err.toString())
        return await result.delete()
      })
  }
}