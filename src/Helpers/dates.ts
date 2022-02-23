export const addMinutes = (d: Date, minutes: number): Date => {
	return new Date(d.getTime() + minutes * 60000);
};