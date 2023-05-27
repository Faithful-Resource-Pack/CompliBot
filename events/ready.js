const client = require('../index').Client
const cron = require('cron')

const DEV = (process.env.DEV.toLowerCase() == 'true')
const MAINTENANCE = (process.env.MAINTENANCE.toLowerCase() == 'true')
const PREFIX = process.env.PREFIX

const settings = require('../resources/settings.json')

const { retrieveSubmission } = require('../functions/textures/submission/retrieveSubmission')
const { councilSubmission } = require('../functions/textures/submission/councilSubmission')
const { downloadResults } = require('../functions/textures/admission/downloadResults')
const { pushTextures } = require('../functions/textures/admission/pushTextures')

const { checkTimeout } = require('../functions/moderation/checkTimeout')
const { restartAutoDestroy } = require('../functions/restartAutoDestroy')
const { saveDB } = require('../functions/saveDB')
const { doCheckLang } = require('../functions/strings/doCheckLang')
const { doCheckSettings } = require('../functions/settings/doCheckSettings')

/**
 * SCHEDULED FUNCTIONS : Texture Submission
 * - Global process (each day at 00:00 GMT)         : @function submissionProcess
 * - Download process (each day at 00:10 GMT)       : @function downloadToBot
 * - Push to GitHub process (each day at 00:15 GMT) : @function pushToGithub
 */
const submissionProcess = new cron.CronJob('0 0 * * *', async () => {
  // Faithful 32x
  await retrieveSubmission(client, settings.channels.submit_textures.c32, settings.channels.submit_council.c32, 2)
  await councilSubmission(client, settings.channels.submit_council.c32, settings.channels.submit_results.c32, 1)
  // Faithful 64x
  await retrieveSubmission(client, settings.channels.submit_textures.c64, settings.channels.submit_council.c64, 2)
  await councilSubmission(client, settings.channels.submit_council.c64, settings.channels.submit_results.c64, 1)
})
const downloadToBot = new cron.CronJob('15 0 * * *', async () => {
  await downloadResults(client, settings.channels.submit_results.c32)
  await downloadResults(client, settings.channels.submit_results.c64)
})
let pushToGithub = new cron.CronJob('30 0 * * *', async () => {
  await pushTextures()
  await saveDB(`Daily Backup`)
})

module.exports = {
  name: 'ready',
  once: true,
  // eslint-disable-next-line no-unused-vars
  async execute() {
    console.log(`┌─────────────────────────────────────────────────────────────┐`)
    console.log(`│                                                             │`)
    console.log(`│  ─=≡Σ((( つ◕ل͜◕)つ                                           │`)
    console.log(`│ JavaScript is a pain, but I'm fine, I hope...               │`)
    console.log(`│                                                             │`)
    console.log(`└─────────────────────────────────────────────────────────────┘\n\n`)

    if (MAINTENANCE) client.user.setPresence({ activities: [{ name: 'maintenance' }], status: 'dnd' })
    else client.user.setActivity('Pigstep', { type: 'LISTENING' })

    await restartAutoDestroy(client)

    if (DEV) {
      setInterval(() => {
        // doCheckLang() // strings have been moved entirely to this repo
        doCheckSettings()
      }, 20000); // 20 seconds
    }

    if (DEV) return

    /**
     * START TEXTURE SUBMISSION PROCESS
     * @see submissionProcess
     * @see downloadToBot
     * @see pushToGithub
     */
    submissionProcess.start()
    downloadToBot.start()
    pushToGithub.start()

    /**
     * LOOP EVENTS
     * @event doMCUpdateCheck() -> each minute | MINECRAFT UPDATE DETECTION INTERVAL
     * @event doCheckLang()     -> each minute | LANG FILE UPDATE
     * @event checkTimeout()    -> every 30s   | MODERATION MUTE SYSTEM UPDATE INTERVAL
     */
    setInterval(() => {
      // doCheckLang()
      doCheckSettings()
    }, 60000);
    setInterval(() => {
      checkTimeout(client)
    }, 30000);
  }
}
