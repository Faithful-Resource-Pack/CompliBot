const { warnUser } = require('./warnUser')
const strings = require('../resources/strings')

/**
 * 
 * @param {DiscordMessage} message Discord Message
 * @param {Array} args Array of String
 * @returns parsed args
 */
function parseArgs(message, args) {

	for (var i = 0; i < args.length; i++) {
		
		if (args[i].startsWith('-')) {
			for (var j = i+1; j < args.length; j++) {
				if (args[j].startsWith('-')) break
				else {
					args[i] += ` ${args[j]}`
					args[j] = ''
				}
			}
		}

		else if (args[i] != '') {
			warnUser(message, strings.PARSE_ARGS)
		}
	}

	return args.filter(a => a !== '')
}

exports.parseArgs = parseArgs