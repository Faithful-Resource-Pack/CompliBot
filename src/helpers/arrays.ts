import { normalize } from "path";

/**
 * Apply the `normalize()` method on an array
 * @param arr {Array<string>} the array to apply the method
 * @returns {arr<string>}
 */
export const normalizeArray = (arr: Array<string>): Array<string> => {
	return arr.map((e) => normalize(e));
};

/**
 * Test if an array of string include in one of it's string the given value
 * @param arr {Array<string>} the asked array
 * @param val {string} the searched string
 * @returns {boolean} True if nothing if found
 */
export const includesNone = (arr: Array<string>, val: string): boolean => {
	let res: boolean = true;
	let i = 0;
	while (i < arr.length && res) {
		res = !val.includes(arr[i]);
		i++;
	}

	return res;
};

/**
 * Duplicate value of an array to a double nested array
 * (used for slash commands strings options)
 * ["test", "options"] => [["test", "test"], ["options", "options"]]
 * @param arr {Array<T>}
 */
export const doNestedArr = (arr: Array<any>): Array<[any, any]> => {
	return arr.map((v) => [v, v]);
};
