/**
 * Get today's date as a string
 * @returns {String} dd/mm/yyyy
 */
module.exports = function date() {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
	const yyyy = today.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
};
