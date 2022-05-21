import { Client } from '@client';
import { CommandInteraction, Constants, Intents } from 'discord.js';

import config from '@json/config.json';
import tokens from '@json/tokens.json';
import { readFileSync } from 'fs';
import path from 'path';

//this is my 13th reason why
export let changelogOptions = () => {
  const changelogStr = readFileSync(
    path.join(__dirname, '../', 'CHANGELOG.md').replace('dist\\', ''),
    'utf-8',
  ).replaceAll('\r', '');
  const allVersions = changelogStr.match(/(?<=## )([^]*?)(?=(\n## )|($))/g);

  let versions = [
    {
      name: `${allVersions[1].substring(1, 7)} next`,
      value: allVersions[1].substring(1, 7),
    },
    {
      name: `${allVersions[2].substring(1, 7)} current`,
      value: allVersions[2].substring(1, 7),
    },
  ];

  for (let i = 2; i < allVersions.length; i++) {
    versions.push({
      name: allVersions[i].substring(1, 7),
      value: allVersions[i].substring(1, 7),
    });
  }

  return versions as {
    name: string;
    value: string;
  }[];
};

export function StartClient(coldStart: boolean = true, interaction?: CommandInteraction) {
  new Client(
    {
      config: config,
      tokens: tokens,
      verbose: tokens.verbose,
      allowedMentions: {
        parse: ['users', 'roles'],
        repliedUser: false,
      }, // remove this line to die instantly ~JackDotJS 2021
      restTimeOffset: 0,
      partials: Object.values(Constants.PartialTypes),
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
      ],
    },
    coldStart,
  ).init(interaction);
}

StartClient();
