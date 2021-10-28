// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios = require('axios')

const minecraftVersionsCache = []

exports.loadMCVersions = async () =>  {
	const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')

	if (versions === '' || status !== 200) {
		console.log('Failed to load Java Minecraft versions')
		return
	}

	versions.versions.forEach(version => {
		// uncomment to test for specific versions being released
		//if (version.id === '1.17-rc1') return
		minecraftVersionsCache.push(version.id)
	})

	console.log(`Loaded ${minecraftVersionsCache.length} Java Minecraft versions`)
}

exports.updateMCVersions = async (client) => {
	try {
		const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest.json')

		if (versions === '' || status !== 200) {
			return
		}
  
		versions.versions.forEach(async version => {
			if (!minecraftVersionsCache.includes(version.id)) {
				minecraftVersionsCache.push(version.id)

				let updateMessage
				let updateChannel = await client.channels.cache.get('773983707299184703')

				if (version.id.includes('pre')) {
					updateMessage = await updateChannel.send({ content: `A new pre-release of Minecraft Java was just released: \`${version.id}\`` })
					await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-pre-release-${version.id.split('pre')[1]}` })
				}
				else if (version.id.includes('rc')) {
					updateMessage = await updateChannel.send({ content: `A new release candidate of Minecraft Java was just released: \`${version.id}\`` })
					await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-release-candidate-${version.id.split('rc')[1]}` })
				}
				else {
					updateMessage = await updateChannel.send({ content: `A new ${version.type} of Minecraft Java was just released: \`${version.id}\`` })
					if (version.type === 'snapshot') await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-snapshot-${version.id}` })
					else if (version.type === 'release') await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-java-edition-${version.id.replace(/\./g,'-')}` })
				}
			}
		})
	} catch (e) {
		return
	}
}