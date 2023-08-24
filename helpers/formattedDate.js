/**
 * Get today's date as a string
 * @author Juknum, Evorp
 * @param {"ymd" | "dmy" | "mdy"?} format format to send date as
 */
module.exports = function formattedDate(format = "dmy") {
	const today = new Date();
	const dd = String(today.getDate()).padStart(2, "0");
	// adding one since it starts at zero
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
