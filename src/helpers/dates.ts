export const addMinutes = (d: Date, minutes: number): Date => {
	if (minutes === null) minutes = 1;
	return new Date(d.getTime() + minutes * 60000);
};

// todo: add more functions
