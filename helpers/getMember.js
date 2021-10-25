/**
 * Fetches the id of a mentioned user
 * @author RobertR11
 * @author ewanhowell5195
 * @param {String} message The message which includes the user
 * @param {String} arg The argument where the user is mentioned
 * @returns Returns the id of the user
 */
async function getMember(message, arg) {
    let member
    try {
        const id = arg.replace(/\D+/g, "")
        if(id === "") {
            throw Error
        } else {
            member = await message.guild.members.fetch(id)
        }
    } catch {
        try {
            member = (await message.guild.members.search({
                query: arg,
                cache: false
            })).first()
        } catch(err) {console.log(err)}
    }
    return member.id
}

exports.getMember = getMember