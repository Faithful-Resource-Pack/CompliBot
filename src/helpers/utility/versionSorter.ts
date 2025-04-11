/**
 * Sorts a given collection of Minecraft versions
 * @example [].sort(versionSorter)
 * @author TheRolf
 */
export default function versionSorter(a: string, b: string) {
	const aSplit = a.split(".").map((s) => parseInt(s, 10));
	const bSplit = b.split(".").map((s) => parseInt(s, 10));

	if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
		return String(a).localeCompare(String(b)); // compare as strings
	}

	const upper = Math.min(aSplit.length, bSplit.length);
	let result = 0;
	for (let i = 0; i < upper && result === 0; ++i) {
		// each number in version
		if (aSplit[i] === bSplit[i]) result = 0;
		else result = aSplit[i] < bSplit[i] ? -1 : 1;
	}

	if (result !== 0) return result;

	if (aSplit.length === bSplit.length) return 0;
	// longer length wins
	return aSplit.length < bSplit.length ? -1 : 1;
}
