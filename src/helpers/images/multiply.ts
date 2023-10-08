import { createCanvas, loadImage } from "@napi-rs/canvas";
import { AttachmentBuilder } from "discord.js";
import ColorManager from "@images/colors";
import { ImageSource } from "@helpers/getImage";

export const mcColors = {
	Foliage: "#5BAB46",
	ColdFoliage: "#60A17B",
	HotFoliage: "#1ABF00",
	DryFoliage: "#AEA42A",
	Grass: "#7CBD6B",
	ColdGrass: "#80B497",
	HotGrass: "#47CD33",
	DryGrass: "#BFB755",
	WhiteDye: "#F9FFFE",
	OrangeDye: "#F9801D",
	MagentaDye: "#C74EBD",
	LightBlueDye: "#3AB3DA",
	YellowDye: "#FED83D",
	LimeDye: "#80C71F",
	PinkDye: "#F38BAA",
	GrayDye: "#474F52",
	LightGrayDye: "#9D9D97",
	CyanDye: "#169C9C",
	PurpleDye: "#8932B8",
	BlueDye: "#3C44AA",
	BrownDye: "#835432",
	GreenDye: "#5E7C16",
	RedDye: "#B02E26",
	BlackDye: "#1D1D21",
};

export const mcColorsOptions: { name: string; value: string }[] = Object.keys(mcColors).map(
	(name) => {
		//a cheeky regex for formatting
		return {
			name: name.replace(/([a-z])([A-Z])/g, "$1 $2"),
			value: mcColors[name as keyof typeof mcColors],
		};
	},
);

export async function multiply(origin: ImageSource, color: string) {
	const imageToDraw = await loadImage(origin);
	const canvas = createCanvas(imageToDraw.width, imageToDraw.height);
	const context = canvas.getContext("2d");

	context.imageSmoothingEnabled = false;

	context.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height);
	context.globalCompositeOperation = "multiply";

	context.fillStyle = color;
	context.fillRect(0, 0, imageToDraw.width, imageToDraw.height);

	const data = context.getImageData(0, 0, imageToDraw.width, imageToDraw.height);

	for (let i = 0; i < data.data.length; i += 4) {
		const r = data.data[i];
		const g = data.data[i + 1];
		const b = data.data[i + 2];

		const hex = new ColorManager({ rgb: { r, g, b } }).toHEX().value;
		if (hex.toUpperCase() == color.substring(1)) {
			data.data[i + 3] = 0;
		}
	}

	context.putImageData(data, 0, 0);

	return canvas.toBuffer("image/png");
}

export async function multiplyToAttachment(
	origin: ImageSource,
	color: string,
	name = "tinted.png",
) {
	const buf = await multiply(origin, color);
	return new AttachmentBuilder(buf, { name });
}
