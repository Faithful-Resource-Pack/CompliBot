import { Message } from 'discord.js';

/**
 * Fetches the id of a mentioned user
 * @author RobertR11
 * @author ewanhowell5195
 * @param {Message} message The message which includes the user
 * @param {String} arg The argument where the user is mentioned
 * @returns Returns the id of the user
 */
export async function getMember(message: Message, arg: string) {
	let member;
	try {
		const id = arg.replace(/\D+/g, "");
		if (id === "") {
			throw Error;
		} else {
			member = await message.guild.members.fetch(id);
		}
	} catch {
		try {
			member = (await message.guild.members.search({
				query: arg.split('#')[0],
				cache: false
			})).first();
		} catch (err) { console.log(err); }
	}
	if (!member) return undefined;
	else return member.id;
}