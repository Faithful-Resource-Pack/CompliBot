import Client from '~/Client';
import { Guild } from 'discord.js';
import { Event } from '~/Interfaces';

export const event: Event = {
  name: 'guildMemberAdd',
  run: async (client: Client, guild: Guild) => {
    client.updateMembers(guild.id, client.config.discords.filter(s => s.id === guild.id)[0].updateMember);
  }
}