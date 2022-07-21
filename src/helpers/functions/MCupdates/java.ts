import axios from "axios";
import { info, warning } from "@helpers/logger";
import { Client } from "@client";
import { TextChannel } from "discord.js";

var minecraftVersionsCache = [];

export async function loadJavaVersions() {
	try {
		var { status, data: versions } = await axios.get(
			"https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
		);
	} catch (e) {
		console.log(`${warning}Failed to load Minecraft Java versions`);
		return;
	}

	if (versions === "" || status !== 200) {
		console.log(`${warning}Failed to load Minecraft Java versions`);
		return;
	}

	versions.versions.forEach((version) => {
		// uncomment to test for specific versions being released
		//if (version.id === "1.19.1-pre4") return;
		minecraftVersionsCache.push(version.id);
	});

	console.log(`${info}Loaded ${minecraftVersionsCache.length} Minecraft Java versions`); update checking due to mojang blocking requests to minecraft.net)
}

export async function updateJavaVersions(client: Client) {
	try {
		var { status, data: versions } = await axios.get(
			"https://launchermeta.mojang.com/mc/game/version_manifest_v2.json",
		);
	} catch (e) {
		return;
	}

	if (versions === "" || status !== 200) {
		return;
	}

	versions.versions.forEach(async (version) => {
		if (!minecraftVersionsCache.includes(version.id)) {
			minecraftVersionsCache.push(version.id);

			let updateChannel = (await client.channels.cache.get("773983707299184703")) as TextChannel;
			let description;

      // TODO: Find a way to reliably fetch the article from https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid
      if (version.id.includes('pre')) {
        const pre = version.id.split('pre')[1];
        description = `A new pre-release of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g, '-')}-pre-release-${pre}`;
        if (pre !== '1') description = `A new pre-release of Minecraft Java was just released: \`${version.id}\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g, '-')}-pre-release-${pre}\nIf the above link doesn't work, try \`https://www.minecraft.net/en-us/article/minecraft-${version.id.split('-')[0].replace(/\./g, '-')}-pre-release-${pre - 1}\``;
      } else if (version.id.includes('rc')) {
        // it is very unlikely that there is more than one release candidate, so we'll just use the first one
        // if there is a second one, Mojang will use the first article anyway
        description = `A new release candidate of Minecraft Java was just released: \`${
          version.id
        }\`\nhttps://www.minecraft.net/en-us/article/minecraft-${version.id
          .split('-')[0]
          .replace(/\./g, '-')}-release-candidate-1`;
      } else if (version.type === 'snapshot') {
        description = `A new ${version.type} of Minecraft Java was just released: \`${
          version.id
        }\`\nhttps://www.minecraft.net/en-us/article/minecraft-snapshot-${version.id.slice(0, -1)}a`;
      } else if (version.type === 'release') {
        description = `A new ${version.type} of Minecraft Java was just released: \`${
          version.id
        }\`\nhttps://www.minecraft.net/en-us/article/minecraft-java-edition-${version.id.replace(/\./g, '-')}`;
      }

      await updateChannel.send({
        content: description,
      });
    }
  });
}
