import { normalize } from "path";

/**
 * Apply the `normalize()` method on an array
 * @param {Array<string>} arr - the array to apply the method
 * @returns {arr<string>}
 */
export const normalizeArray = (arr: Array<string>): Array<string> => {
	return arr.map((e) => normalize(e));
};

/**
 * Test if an array of string include in one of it's string the given value
 * @param {Array<string>} arr - the asked array
 * @param {String} val - the searched string
 * @returns {boolean} - true if nothing if found
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
 * @param {Array<T>} arr
 */
export const doNestedArr = (arr: Array<any>): Array<[any, any]> => {
	return arr.map((v) => [v, v]);
};
