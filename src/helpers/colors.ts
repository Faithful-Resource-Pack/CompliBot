export const colors = {
	// status/generic colors
	red: "#f44336",
	yellow: "#ffeb3b",
	blue: "#5865F2",
	black: "#000000",
	council: "#9c3848",
	green: "#4caf50",
	coin: "#ffdc16",
	// branding colors
	brand: "#76c945",
	f32: "#00a2ff",
	f64: "#d8158d",
	cf32: "#00c756",
	cf64: "#9f00cf",
	cf32pa: "#a1db12",
} as const;

export type colorType = keyof typeof colors;
