import versionSorter from "./versionSorter";

/**
 * Convert an array of versions into a formatted version range string
 * @author Juknum, Evorp
 * @param versions Versions to get the range of
 * @returns Sorted version range separated by en dash
 */
export default function versionRange(versions: string[]) {
	// don't bother sorting a single element
	if (versions.length === 1) return versions[0];
	const sorted = versions.toSorted(versionSorter);
	return `${sorted[0]} – ${sorted.at(-1)}`;
}
