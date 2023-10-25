/**
 * Simple object check.
 * @param item item to check.
 * @returns true if item is an object
 */
export const isObject = (item: unknown) =>
	item !== null && item !== undefined && typeof item === "object" && !Array.isArray(item);

/**
 * Merge two objects into the targeted object/array
 * @author Juknum
 * @param target where to add sources to
 * @param sources what to add
 * @returns merged sources
 */
export function mergeDeep(target: any, ...sources: any[]) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else Object.assign(target, { [key]: source[key] });
		}
	}

	return mergeDeep(target, ...sources);
}
