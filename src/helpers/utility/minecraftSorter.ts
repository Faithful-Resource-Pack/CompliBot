/**
 * Sort Minecraft Version Numbers
 * Use this function as a filter for the sort() method:
 * [].sort(minecraftSorter)
 */
export default function minecraftSorter(a: string, b: string) {
	const aSplit = a.split(".").map((s) => parseInt(s));
	const bSplit = b.split(".").map((s) => parseInt(s));

	if (aSplit.includes(NaN) || bSplit.includes(NaN)) {
		return String(a).localeCompare(String(b)); // compare as strings
	}

	const upper = Math.min(aSplit.length, bSplit.length);
	let i = 0;
	let res = 0;
	while (i < upper && res == 0) {
		res = aSplit[i] == bSplit[i] ? 0 : aSplit[i] < bSplit[i] ? -1 : 1; // each number
		++i;
	}

	if (res != 0) return res;
	return aSplit.length == bSplit.length ? 0 : aSplit.length < bSplit.length ? -1 : 1; // longer length wins
}
