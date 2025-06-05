/**
 * Add seconds to a date
 * @author Juknum
 * @param d the date to add seconds to
 * @param seconds the number of seconds to add
 * @returns the new date
 */
export const addSeconds = (d: Date, seconds?: number) => {
	d.setSeconds(d.getSeconds() + (seconds ?? 1));
	return d;
};

/**
 * Parse user input into seconds
 * @author Juknum
 * @param d user input
 * @returns equivalent in seconds
 */
export function parseDate(d: string) {
	if ((d.endsWith("y") && !d.endsWith("day")) || d.endsWith("year") || d.endsWith("years"))
		return parseInt(d, 10) * 24 * 3600 * 365;
	if (d.endsWith("mon") || d.endsWith("month") || d.endsWith("months"))
		return parseInt(d, 10) * 30 * 24 * 3600;
	if (d.endsWith("w") || d.endsWith("week") || d.endsWith("weeks"))
		return parseInt(d, 10) * 7 * 86400;
	if (d.endsWith("d") || d.endsWith("day") || d.endsWith("days")) return parseInt(d, 10) * 86400;
	if (d.endsWith("h") || d.endsWith("hours") || d.endsWith("hour")) return parseInt(d, 10) * 3600;
	if (d.endsWith("m") || d.endsWith("min") || d.endsWith("minute") || d.endsWith("minutes"))
		return parseInt(d, 10) * 60;
	if (d.endsWith("s") || d.endsWith("second") || d.endsWith("seconds")) return parseInt(d, 10);

	return parseInt(d, 10); // default value is considered to be seconds
}

/**
 * Convert timestamp to human readable format (e.g. 1028193718 = 10/28/1937)
 * @author Juknum
 * @param t timestamp to convert
 * @returns human readable format
 */
export function fromTimestampToHumanReadable(t: number) {
	if (t === undefined) return "01/01/1970";

	const date = new Date(Number(t)); // cast to int because it might be a string
	return `${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}/${
		date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
	}/${date.getFullYear()}`;
}
