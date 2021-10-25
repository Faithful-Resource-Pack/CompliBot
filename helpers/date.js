/**
 * Get today's date as a string
 * @returns String: dd/mm/yyyy
 */
function date() {
	var today = new Date()
	var dd = String(today.getDate()).padStart(2, '0')
	var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
	var yyyy = today.getFullYear()
	return `${dd}/${mm}/${yyyy}`
}

exports.date = date