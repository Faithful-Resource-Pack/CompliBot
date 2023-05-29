const client = require('../index').Client
const DEV = (process.env.DEV.toLowerCase() == 'true')
const DEV_REACTION = (process.env.DEV_REACTION || false) == 'true'
const settings = require('../resources/settings.json')

const { editSubmission } = require('../functions/textures/submission/editSubmission')

module.exports = {
    name: "messageReactionAdd",
    async execute(reaction, user) {
        if (DEV || user.bot) return;
        if (reaction.message.partial) await reaction.message.fetch(); // dark magic to fetch message that are sent before the start of the bot

        // TEXTURE SUBMISSIONS
        const channelArray = Object.values(settings.submission).map(i => Object.values(i.channels)).flat();

        if (channelArray.includes(reaction.message.channel.id)) {
            editSubmission(client, reaction, user);
        }
    },
};