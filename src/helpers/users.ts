import { Client, Message } from '@client';
import { GuildMember, User } from 'discord.js';
import { err } from '@helpers/logger';

/**
 * Check if the given user object is a true user object by trying to fetch its id from the client users list
 * @warning this function will return true if the user instance is @see GuildMember
 * @param {Client} client - the discord client
 * @param {any} user - the user object to check
 * @returns {Promise<boolean>} true if the user is a true user object, false otherwise
 */
export const checkIfUser = async (client: Client, user: any): Promise<boolean> => {
  let u: User;

  try {
    u = await client.users.fetch(user.id);
  } catch {
    return false;
  }

  return true;
};

/**
 * Fetches the id of a mentioned user
 * @author @RobertRR11
 * @author @ewanhowell5195
 * @param {Message} message The message which includes the user
 * @param {String} arg The argument where the user is mentioned
 * @returns {Promise<String>} the id of the user
 */
export const getMember = async (message: Message, arg: string): Promise<string> => {
  if (!arg.length) return undefined;

  let member: GuildMember;
  try {
    const id = arg.replace(/\D+/g, '');
    if (id === '') {
      throw Error;
    } else {
      member = await message.guild.members.fetch(id);
    }
  } catch {
    try {
      member = (
        await message.guild.members.search({
          query: arg.split('#')[0],
          cache: false,
        })
      ).first();
    } catch (error) {
      console.log(err + error);
    }
  }
  if (!member) return undefined;
  else return member.id;
};
