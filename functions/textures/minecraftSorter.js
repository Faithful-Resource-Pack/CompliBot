/**
 * Sorts a given collection of Minecraft versions
 */
module.exports = function (a, b) {
	const aSplit = a.split('.').map(s => parseInt(s))
	const bSplit = b.split('.').map(s => parseInt(s))

	const upper = Math.min(aSplit.length, bSplit.length)
	let i = 0
	let result = 0
	while (i < upper && result == 0) {
	  result = (aSplit[i] == bSplit[i]) ? 0 : (aSplit[i] < bSplit[i] ? -1 : 1) // each number
	  ++i
	}

	if (result != 0) return result

	result = (aSplit.length == bSplit.length) ? 0 : (aSplit.length < bSplit.length ? -1 : 1) // longer length wins

	return result
}