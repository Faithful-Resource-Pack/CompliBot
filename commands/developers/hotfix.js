/* eslint-disable no-unused-vars */
const prefix   = process.env.PREFIX

const uidR = process.env.UIDR
const uidJ = process.env.UIDJ
const uidD = process.env.UIDD
const uidT = process.env.UIDT

const fs = require('fs')

const strings                = require('../../resources/strings')
const emojis                 = require('../../resources/emojis')
const settings               = require('../../resources/settings')
const colors                 = require('../../resources/colors')
const allCollection          = require('../../helpers/firestorm/all')
const { retrieveSubmission } = require('../../functions/textures/submission/retrieveSubmission')
const { councilSubmission }  = require('../../functions/textures/submission/councilSubmission')
const { revoteSubmission }   = require('../../functions/textures/submission/revoteSubmission')
const { downloadResults }    = require('../../functions/textures/admission/downloadResults')
const { pushTextures }       = require('../../functions/textures/admission/pushTextures')
const { saveDB }             = require('../../functions/saveDB')

module.exports = {
	name: 'hotfix',
	aliases: ['fix'],
	description: strings.HELP_DESC_HOTFIX,
	guildOnly: false,
	uses: strings.COMMAND_USES_DEVS,
	syntax: `${prefix}hotfix <something>`,
	args: true,
	async execute(client, message, args) {
		if (message.author.id === uidR || message.author.id === uidJ || message.author.id === uidD || message.author.id === uidT) {

			let msg = await client.channels.cache.get('774220983044669450').messages.fetch('894343057514840138')

			let channelResults = client.channels.cache.get('780507804317384744')
			let embed = msg.embed
			embed.setColor(colors.GREEN)
			embed.fields[1].value = `<:upvote:${emojis.UPVOTE}> Will be added in a future version!`

			channelResults.send({embeds: [embed]})
			.then(async sentMessage => {
				for (const emojiID of [emojis.SEE_MORE]) await sentMessage.react(client.emojis.cache.get(emojiID))
			})

		} else return
	}
}
