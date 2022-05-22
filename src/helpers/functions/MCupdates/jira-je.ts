import axios from 'axios';
import { info, warning } from '@helpers/logger';
import { Client } from '@client';
import { TextChannel } from 'discord.js';

const jiraVersionsCache = [];

export async function loadJiraJavaVersions() {
  let status: number;
  let versions;

  try {
    const res = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MC/versions');
    status = res.status;
    versions = res.data;
  } catch (e) {
    console.log(`${warning}Failed to load Jira Minecraft Java versions`);
    return;
  }

  if (versions === '' || status !== 200) {
    console.log(`${warning}Failed to load Jira Minecraft Java versions`);
    return;
  }

  versions.forEach((version) => {
    jiraVersionsCache.push(version.name);
  });

  console.log(`${info}Loaded ${jiraVersionsCache.length} Jira Minecraft Java versions`);
}

export async function updateJiraJavaVersions(client: Client) {
  let status: number;
  let versions;

  try {
    const res = await axios.get('https://bugs.mojang.com/rest/api/latest/project/MC/versions');
    status = res.status;
    versions = res.data;
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
        const updateChannel = (await client.channels.cache.get('773983707299184703')) as TextChannel;
        updateChannel.send({
          content: `A new Minecraft Java version has been added to the Minecraft issue tracker: \`${version.name}\``,
        });
      }
    }
  });
}
