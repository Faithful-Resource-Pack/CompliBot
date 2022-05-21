import { Client, GuildMember } from '@client';
import { Event } from '@interfaces';

export const event: Event = {
  name: 'guildMemberAdd',
  run: async (client: Client, member: GuildMember) => {
    //! do not remove, 'force' member to be casted (break if removed)
    let _ = (member as GuildMember) instanceof GuildMember;

    member.createdTimestamp = new Date().getTime();
    member.reason = 'added';
    client.storeAction('guildMemberUpdate', member);

    const updateChannel: string = client.config.discords.filter((s) => s.id === member.guild.id).pop()
      .channels.updateMember;
    if (updateChannel) client.updateMembers(member.guild.id, updateChannel);
  },
};
