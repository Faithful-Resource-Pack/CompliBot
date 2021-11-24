// This code is based on the GeyserMC Discord Bot (https://github.com/GeyserMC/GeyserDiscordBot)

const axios = require('axios')

const minecraftVersionsCache = []

exports.loadMCVersions = async () =>  {
	const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json')

	if (versions === '' || status !== 200) {
		console.log('Failed to load Java Minecraft versions')
		return
	}

	versions.versions.forEach(version => {
		// uncomment to test for specific versions being released
		//if (version.id === '1.18-pre5') return
		minecraftVersionsCache.push(version.id)
	})

	console.log(`Loaded ${minecraftVersionsCache.length} Java Minecraft versions`)
}

exports.updateMCVersions = async (client) => {
	try {
		const { status, data: versions } = await axios.get('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json')

		if (versions === '' || status !== 200) {
			return
		}
  
		versions.versions.forEach(async version => {
			if (!minecraftVersionsCache.includes(version.id)) {
				minecraftVersionsCache.push(version.id)

				let updateMessage
				let updateChannel = await client.channels.cache.get('773983707299184703')

				if (version.id.includes('pre')) {
					var pre = version.id.split('pre')[1]
					let res
					res = await axios.get(`https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-pre-release-${pre}`, {validateStatus: () => true})

					if (res.status == 404) {
						for (pre; pre > 1; pre--) {
							res = await axios.get(`https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-pre-release-${pre}`, {validateStatus: () => true})

							if (res.status !== 404) {
								updateMessage = await updateChannel.send({ content: `A new pre-release of Minecraft Java was just released: \`${version.id}\`` })
								await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-pre-release-${pre}` })
								break;
							}
						}
					}

					else {
						updateMessage = await updateChannel.send({ content: `A new pre-release of Minecraft Java was just released: \`${version.id}\`` })
						await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-pre-release-${pre}` })
					}
				}
				else if (version.id.includes('rc')) {
					updateMessage = await updateChannel.send({ content: `A new release candidate of Minecraft Java was just released: \`${version.id}\`` })

					// it is very unlikely that there is more than one release candidate, so we'll just use the first one
					// if there is a second one, Mojang will use the first article anyway
					await updateMessage.reply({ content: `https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g,'-')}-release-candidate-1` })
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