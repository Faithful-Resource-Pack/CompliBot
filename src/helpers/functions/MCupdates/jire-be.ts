import axios from 'axios';
import { info, warning } from '@helpers/logger';
import { Client } from '@client';
import { TextChannel } from 'discord.js';

const jiraVersionsCache = [];

export async function loadJiraBedrockVersions() {
  try {
    var { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MCPE/versions');
  } catch (e) {
    console.log(`${warning}Failed to load Jira Minecraft Bedrock versions`);
    return;
  }

  if (versions === '' || status !== 200) {
    console.log(`${warning}Failed to load Jira Minecraft Bedrock versions`);
    return;
  }

  versions.forEach((version) => {
    jiraVersionsCache.push(version.name);
  });

  console.log(`${info}Loaded ${jiraVersionsCache.length} Jira Minecraft Bedrock versions`);
}

export async function updateJiraBedrockVersions(client: Client) {
  try {
    var { status, data: versions } = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MCPE/versions');
  } catch (e) {
    return;
  }

  if (versions === '' || status !== 200) {
    return;
  }

  versions.forEach(async (version) => {
    if (!jiraVersionsCache.includes(version.name)) {
      jiraVersionsCache.push(version.name);
      if (!version.name.includes('Future Version')) {
        let updateChannel = (await client.channels.cache.get('773983707299184703')) as TextChannel;
        updateChannel.send({
          content: `A new Minecraft Bedrock version has been added to the Minecraft issue tracker: \`${version.name}\``,
        });
      }
    }
  });
}
