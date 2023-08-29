const { createCanvas, loadImage, ImageData } = require("@napi-rs/canvas");
const { MessageAttachment } = require("discord.js");

const { magnifyBuffer } = require("./magnify");

const settings = require("../../resources/settings.json");

/**
 * shows the per-pixel difference between two images:
 * blue is changed
 * red is removed
 * green is added
 * @author Evorp, EwanHowell
 * @param {String} firstUrl first url to compare
 * @param {String} secondUrl second url to compare
 * @param {Number?} tolerance difference between colors considered acceptable
 * @returns {Promise<import("discord.js").MessageAttachment>} compared image
 */
module.exports = async function difference(firstUrl, secondUrl, tolerance = 0) {
	let mappedUrls = [];
	let invalidUrl = false;
	for (let url of [firstUrl, secondUrl]) {
		const temp = await magnifyBuffer(url).catch(() => {
			invalidUrl = true;
		});
		// null values are handled in the button code itself
		if (invalidUrl) return null;
		// we can only destructure once we check for null
		const { magnified, width, height } = temp;
		const img = await loadImage(magnified);
		const canvas = createCanvas(width, height);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(img, 0, 0);
		const pixels = ctx.getImageData(0, 0, width, height).data;
		mappedUrls.push({ pixels, width, height });
	}

	// if the images are somehow uneven at this point we can just take the biggest one
	const finalWidth = Math.max(...mappedUrls.map((i) => i.width));
	const finalHeight = Math.max(...mappedUrls.map((i) => i.height));
	const length = finalWidth * finalHeight * 4;

	// need to convert from hex to [r, g, b, a]
	const blue = hexToArr(settings.colors.blue);
	const green = hexToArr(settings.colors.green);
	const red = hexToArr(settings.colors.red);

	// this part is pretty much all ewan so don't ask me how it works
	const buff = new Uint8ClampedArray(finalWidth * finalHeight * 4);

	for (let i = 0; i < length; i += 4) {
		const x = (i / 4) % finalWidth;
		const y = Math.floor(i / 4 / finalWidth);
		if (
			(x >= mappedUrls[0].width && y >= mappedUrls[1].height) ||
			(x >= mappedUrls[1].width && y >= mappedUrls[0].height)
		)
			continue;
		else if (
			(x >= mappedUrls[1].width && x <= mappedUrls[0].width) ||
			(y >= mappedUrls[1].height && y <= mappedUrls[0].height)
		)
			buff.set(red, i);
		else if (
			(y >= mappedUrls[0].height && y <= mappedUrls[1].height) ||
			(x >= mappedUrls[0].width && x <= mappedUrls[1].width)
		)
			buff.set(green, i);
		else {
			const i1 = (x + y * mappedUrls[0].width) * 4;
			const i2 = (x + y * mappedUrls[1].width) * 4;
			if (
				Math.max(
					Math.abs(mappedUrls[0].pixels[i1] - mappedUrls[1].pixels[i2]),
					Math.abs(mappedUrls[0].pixels[i1 + 1] - mappedUrls[1].pixels[i2 + 1]),
					Math.abs(mappedUrls[0].pixels[i1 + 2] - mappedUrls[1].pixels[i2 + 2]),
					Math.abs(mappedUrls[0].pixels[i1 + 3] - mappedUrls[1].pixels[i2 + 3]),
				) < tolerance
			) {
				buff.set(mappedUrls[0].pixels.slice(i1, i1 + 3), i);
				buff[i + 3] = mappedUrls[0].pixels[i1 + 3] / 4;
			} else if (mappedUrls[0].pixels[i1 + 3] === 0 && mappedUrls[1].pixels[i2 + 3] !== 0)
				buff.set(green, i);
			else if (mappedUrls[0].pixels[i1 + 3] !== 0 && mappedUrls[1].pixels[i2 + 3] === 0)
				buff.set(red, i);
			else if (
				mappedUrls[0].pixels[i1] === mappedUrls[1].pixels[i2] &&
				mappedUrls[0].pixels[i1 + 1] === mappedUrls[1].pixels[i2 + 1] &&
				mappedUrls[0].pixels[i1 + 2] === mappedUrls[1].pixels[i2 + 2] &&
				mappedUrls[0].pixels[i1 + 3] === mappedUrls[1].pixels[i2 + 3]
			) {
				buff.set(mappedUrls[0].pixels.slice(i1, i1 + 3), i);
				buff[i + 3] = mappedUrls[0].pixels[i1 + 3] / 4;
			} else buff.set(blue, i);
		}
	}

	// convert the edited buffer to a canvas
	const out = createCanvas(finalWidth, finalHeight);
	out.getContext("2d").putImageData(new ImageData(buff, finalWidth, finalHeight), 0, 0);
	const finalBuffer = out.toBuffer("image/png");
	// convert the canvas to a MessageAttachment
	return new MessageAttachment(finalBuffer, "diff.png");
};

/**
 * converts from hex string to array of rgba numbers
 * @author Evorp
 * @param {String} hex e.g. #a1b2c3
 * @returns {Number[]} [r, g, b, a] array
 */
function hexToArr(hex) {
	hex = hex.replace("#", "");
	// hack I found on stackoverflow to split into groups of two
	const splitHex = hex.match(/.{1,2}/g);
	const finalArr = splitHex.map((i) => parseInt(`0x${i}`));
	// add alpha
	finalArr.push(255);
	return finalArr;
}
