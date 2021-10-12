// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios   = require('axios')
const Discord = require("discord.js");

const jiraVersionsCache = []

exports.loadJiraVersions = async (client) =>  {
	const { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MC/versions', {
		headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
	})

	// temporary logging, will be removed soon
	const channel = client.channels.cache.get('897476033136189460')
	const embed = new Discord.MessageEmbed()
		.setTitle('First connection to bugs.mojang.com, tracking Jira Java Updates')
		.setDescription(`Status: ${status}`)
		.setTimestamp()

	channel.send({ embeds: [embed] })

	if (versions === '' || status !== 200) {
		console.log('Failed to load Java jira versions')
		return
	}

	versions.forEach(version => {
		jiraVersionsCache.push(version.name)
	})

	console.log(`Loaded ${jiraVersionsCache.length} Java jira versions`)
}

exports.updateJiraVersions = async (client) => {
	try {
		const { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MC/versions', {
			headers: { 'User-Agent':'Mozilla/5.0 (compatible; complibot-discord-bot/1.0; +https://github.com/Compliance-Resource-Pack/Discord-Bot)' }
		})

		// temporary logging, will be removed soon
		const channel = client.channels.cache.get('897476033136189460')
		const embed = new Discord.MessageEmbed()
			.setTitle('updating Jira Java versions')
			.setDescription(`Status: ${status}`)
			.setTimestamp()

		channel.send({ embeds: [embed] })

		if (versions === '' || status !== 200) {
			return
		}

		versions.forEach(version => {
			if (!jiraVersionsCache.includes(version.name)) {
				jiraVersionsCache.push(version.name)
				if (!version.name.includes('Future Version')) {
					client.channels.cache.get('773983707299184703').send({content: `A new Java version has been added to the Minecraft issue tracker: \`${version.name}\``})
				}
			}
		})
	} catch (e) {
		return
	}
}