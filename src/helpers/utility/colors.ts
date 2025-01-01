import { ColorResolvable } from "discord.js";

export const colors = {
	// status/generic colors
	red: "#f44336",
	yellow: "#ffdc16",
	blue: "#5865F2",
	black: "#000000",
	council: "#9c3848",
	green: "#4caf50",
	coin: "#ffdc16",
	// branding colors
	brand: "#76C945",
	faithful_32x: "#00A2FF",
	faithful_64x: "#FF0092",
	classic_faithful_32x: "#1257CA",
	classic_faithful_32x_progart: "#5ED900",
	classic_faithful_64x: "#FF6900",
	classic_faithful_64x_progart: "#BE42FF",
	// workaround for getting const keys + djs compatible values
} satisfies Record<string, ColorResolvable>;
