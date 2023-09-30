export const randint = (start: number, stop: number) =>
	Math.floor(start + Math.random() * (stop - start + 1));
export const choice = <T>(arr: T[]): T => arr[randint(0, arr.length - 1)];
export const shuffle = <T>(arr: T[]): T[] => arr.sort(() => randint(-1, 1));
