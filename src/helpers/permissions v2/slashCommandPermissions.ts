import { getRolesIds } from "@helpers/roles";
import { CommandInteraction, GuildMemberRoleManager } from "discord.js";

export interface permissionOptions {
	/* 
    type sets weather checkPermissions 
    should use the config or ids to
    run its checks. By default set to
    "config" as its most used.
    
    IF TYPE IS CONFIG:
        it will use names
        instead of ids and look them up in
        `config.json`.

        ? servers: ["dev", "faithful"] => ["720677267424018526", "773983706582482946"]
        ? roles: ["trial_moderators"] => ["890728061128036353", "890729435395936286", "938859628144513024"]
        roles have different roles for different servers so it will check all of them.

        !users is an exception to this and will still be tied to ids
    IF TYPE IS ID:
        it wont perform any lookup and ids
        will stay the same.

    added presets for an easier time
    */
	type?: "id" | "config" | "dev" | "mod" | "council";

	servers?: Array<string>; //will only use ids if type == id
	roles?: Array<string>; //will only use ids if type == id
	users?: Array<string>; //will always use ids
}
export enum permissionCodeEnum {
	servers,
	users,
	roles,
}

// [true, true, true] => allowed to use command, no checks failed
// permissionCode[permissionCodeEnum.<check>] to see if a check passed
type permissionCode = [boolean, boolean, boolean];

/**
 * @author nick-1666
 * @param interaction CommandInteraction
 * @param permissions {@link permissionOptions}
 *
 * @returns returns a permission code (see: {@link permissionCode}) containing information
 * about which checks passed. Useful for determining what to reply when checks dont pass.
 *
 * @example checkPermissions(interaction, { servers: ["faithful", "dev"], roles: ["council", "administrator"]})
 */

//TODO: use a bearer token for v2 in the future. This is a temporary workaround
export function checkPermissions(
	interaction: CommandInteraction,
	permissions: permissionOptions,
): permissionCode {
	let code: permissionCode = [true, true, true];

	let type = permissions.type ? permissions.type : "config";

	//presets
	switch (type) {
		case "council":
			type = "config";
			permissions = {
				roles: ["council"],
			};
			break;
		case "dev":
			type = "config";
			permissions = {
				users: [
					"207471947662098432",
					"173336582265241601",
					"601501288978448411",
					"473860522710794250",
				],
			};
			break;
		case "mod":
			type = "config";
			permissions = {
				roles: ["moderators", "trial_moderators"],
			};
			break;
		default:
			break;
	}

	// no userIDs in config so this applies to all
	if (permissions.users && !permissions.users.includes(interaction.user.id))
		code[permissionCodeEnum.users] = false;

	if (type == "id") {
		if (permissions.servers && !permissions.servers.includes(interaction.guildId))
			code[permissionCodeEnum.servers] = false;
		if (
			permissions.roles &&
			!(interaction.member.roles as GuildMemberRoleManager).cache.some((r) =>
				permissions.roles.includes(r.id),
			)
		)
			code[permissionCodeEnum.roles] = false;
	}

	if (type == "config") {
		const config = require("@json/config.json");

		if (permissions.roles) {
			const roles = (interaction.member.roles as GuildMemberRoleManager).cache.map((r) => r.id);
			code[permissionCodeEnum.roles] = roles.some((r) =>
				getRolesIds({ name: permissions.roles, discords: "all", teams: "all" }).includes(r),
			);
		}

		if (permissions.servers) {
			const serverIDsToCheck = config.discords
				.map((discord) => {
					if (permissions.servers.includes(discord.name)) return discord.id;
					else return false;
				})
				.filter((v) => v != false);

			if (!serverIDsToCheck.includes(interaction.guildId)) code[permissionCodeEnum.servers] = false;
		}
	}

	return code;
}
