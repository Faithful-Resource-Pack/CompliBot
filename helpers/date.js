/**
 * Get today's date as a string
 * @author Juknum, Evorp
 * @param {"ymd" | "dmy" | "mdy"?} format format to send date as
 */
module.exports = function date(format = "dmy") {
	const today = new Date();
	// adding one for days and months since it starts at zero
	const dd = String(today.getDate() + 1).padStart(2, "0");
	const mm = String(today.getMonth() + 1).padStart(2, "0");
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
