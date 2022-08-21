import { ICommandConfig } from '@interfaces';
import settings from '@config/settings.json';
import {
  channelMention,
  GuildMemberRoleManager,
  LocaleString,
  roleMention,
  userMention,
} from 'discord.js';

/**
 * Checks if the user is authorized to use the command.
 * @param {ICommandConfig} config The command config.
 * @param {string} guildId Id to be checked.
 * @param {string} userId Id to be checked.
 * @param {string} channelId Id to be checked.
 * @param {GuildMemberRoleManager} roles The guild member.
 * @throw if the user is not authorized to use the command.
 */
export async function checkPermissions(config: ICommandConfig, guildId: string, userId: string, channelId: string, roles: GuildMemberRoleManager, locale: LocaleString): Promise<void> {
  const botbanConfig = JSON.configLoad('botban.json');
  if (botbanConfig.banned && botbanConfig.banned.includes(userId)) {
    return Promise.reject(new Error(String.get('permissions_banned_error', locale)));
  }

  if (config.devOnly && settings.developersIds.includes(userId) === false) {
    return Promise.reject(new Error(String.get('permissions_developers_only', locale)));
  }

  // if there is no configuration file, command is always authorized
  if (!config.whitelisted && !config.blacklisted) return Promise.resolve();

  // if there is no whitelist or blacklist for that specific guild, command is authorized
  if (!Object.prototype.hasOwnProperty.call(config.whitelisted, guildId) && !Object.prototype.hasOwnProperty.call(config.blacklisted, guildId)) return Promise.resolve();

  if (config.whitelisted && config.whitelisted[guildId]) {
    const permissions = config.whitelisted[guildId];
    let isAuthorizedChannel = false;
    let isAuthorizedUser = false;
    let isAuthorizedRole = false;

    // if the permission contains the searched id, the command is authorized
    if (permissions.channels && permissions.channels.length > 0) {
      isAuthorizedChannel = permissions.channels.find((channel) => channel === channelId) !== undefined;
    }

    if (permissions.roles && permissions.roles.length > 0) {
      isAuthorizedRole = roles.cache.hasAny(...permissions.roles);
    }

    // the above doesn't stand for the user
    if (permissions.users && permissions.users.length > 0) {
      isAuthorizedUser = permissions.users.find((user) => user === userId) !== undefined;
    }

    if (!isAuthorizedChannel && permissions.channels && permissions.channels.length > 0) {
      return Promise.reject(new Error(String.get('permissions_channel_not_whitelisted', locale, { keys: { CHANNELS: permissions.channels.map((c) => channelMention(c)).join(', ') } })));
    }

    if (!isAuthorizedRole && permissions.roles && permissions.roles.length > 0) {
      return Promise.reject(new Error(String.get('permissions_role_not_whitelisted', locale, { keys: { ROLES: permissions.roles.map((r) => roleMention(r)).join(', ') } })));
    }

    if (!isAuthorizedUser && permissions.users && permissions.users.length > 0) {
      if (!isAuthorizedRole) return Promise.reject(new Error(String.get('permissions_user_not_whitelisted', locale, { keys: { USERS: permissions.users.map((u) => userMention(u)).join(', ') } })));
    }
  }

  if (config.blacklisted && config.blacklisted[guildId]) {
    const permissions = config.blacklisted[guildId];
    let isBlacklistedChannel = false;
    let isBlacklistedUser = false;
    let isBlacklistedRole = false;

    // if the permission contains the searched id, or if there is no ids to search, the command is authorized
    if (permissions.channels && permissions.channels.length > 0) {
      isBlacklistedChannel = permissions.channels.find((channel) => channel === channelId) !== undefined;
    }

    if (permissions.users && permissions.users.length > 0) {
      isBlacklistedUser = permissions.users.find((user) => user === userId) !== undefined;
    }

    if (permissions.roles && permissions.roles.length > 0) {
      isBlacklistedRole = roles.cache.hasAny(...permissions.roles);
    }

    // channel || role || user
    if (isBlacklistedChannel) return Promise.reject(new Error(String.get('permissions_channel_blacklisted', locale)));
    if (isBlacklistedRole) return Promise.reject(new Error(String.get('permissions_role_blacklisted', locale)));
    if (isBlacklistedUser) return Promise.reject(new Error(String.get('permissions_user_blacklisted', locale)));
  }

  return Promise.resolve();
}
