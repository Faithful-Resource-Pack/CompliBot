/**
 * Get today's date as a string
 * @author Juknum, Evorp
 * @param {String?} format format to send date as
 */
module.exports = function date(format = "dmy") {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
	const yyyy = today.getFullYear();

	switch (format) {
		case "dmy":
			return `${dd}/${mm}/${yyyy}`;
		case "mdy":
			return `${mm}/${dd}/${yyyy}`;
		case "ymd":
			return `${yyyy}/${mm}/${dd}`;
	}
};
