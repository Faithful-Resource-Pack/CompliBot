const parseArr = (arr: Array<Array<any>>): Array<any> => {
	const output: Array<any> = [];

	arr.forEach((_arr) => {
		_arr.forEach((el) => {
			output.push(el);
		});
	});

	return output;
};

export { parseArr };
