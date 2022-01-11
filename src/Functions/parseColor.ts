/**
 * Parses strings to color, supports rgb, hsl, standard hex and hex shorthand
 * @author Nick
 * @warning only parses:
 * hex (short & long),
 * 8 digit hex,
 * unprefixed hex (no # or 0x),
 * rgb,
 * rgba
 * @returns {string} Hexidecimal string
 */
export function parseColor(args: string[]): string {
	if (args[0] == 'bingus') return 'F4CAC5'; //bingus color support DO NOT REMOVE it will break 100% totally

	//check for rgb or hsl
	if (/rgba?\(\d+,\d+,\d+\,?\d+?.?\d+\)/i.test(args.join('').replaceAll('%', '').toLowerCase())) return rgb(args.join('').toLowerCase());
	//if (/hsl\(\d+,\d+,\d+\)/i.test(args.join('').replaceAll('%', '').toLowerCase())) return hsl(); //todo: hsv, hsva & hsl, hsla

	//not rgb or hsl
	if (/^(#|0x)?(?:[0-9a-f]{3,4}){1,2}$/g.test(args[0].toLowerCase())) return hex(args[0].toLowerCase());

	//no above checks matched and therefore the color isnt parsable
	return undefined;
}

function hex(string: string): string {
	//removes the # or 0x if any to get the raw hex
	let hex = string;

	if (string.startsWith('#')) hex = string.substring(1);
	if (string.startsWith('0x') && string.substring(2).length < 6) hex = string.substring(2);

	if (hex.length == 3) {
		let [r, g, b] = hex.split('');
		return (r + r + g + g + b + b + 'FF').toUpperCase();
	}

	if (hex.length == 4) {
		let [r, g, b, a] = hex.split('');
		return (r + r + g + g + b + b + a + a).toUpperCase();
	}

	if (hex.length > 6 && !(hex.length > 8)) {
		return string.toUpperCase();
	} else return hex.length > 8 ? undefined : string.toUpperCase() + 'FF';
}

function rgb(string: string): string {
	let rgba = false;
	if (string.startsWith('rgba')) rgba = true;
	let values = string
		.substring(rgba ? 5 : 4)
		.slice(0, -1)
		.split(','); //removes rgb( and the ) then splits the array to values

	if (!rgba) {
		//radix stuffs :)
		let rgb = [parseInt(values[0]).toString(16), parseInt(values[1]).toString(16), parseInt(values[2]).toString(16)];

		//fix missing bits
		for (let i = 0; i < rgb.length; i++) {
			if (rgb[i].length != 2) {
				rgb[i] = '0' + rgb[i];
			}
			if (parseInt(rgba[i]) > 255 || parseInt(rgba[i]) < 0) {
				return undefined;
			}
		}

		return rgb.join('').toUpperCase() + 'FF';
	} else {
		if (parseFloat(values[3]) > 1 || parseFloat(values[3]) < 1) return undefined;
		let rgba = [parseInt(values[0]).toString(16), parseInt(values[1]).toString(16), parseInt(values[2]).toString(16), (parseFloat(values[3]) * 255).toString(16)];
		//fix missing bits
		for (let i = 0; i < rgba.length; i++) {
			if (rgba[i].length != 2) {
				rgba[i] = '0' + rgba[i];
			}
			if ((parseInt(rgba[i]) > 255 && !(i == 3)) || parseInt(rgba[i]) < 0) {
				return undefined;
			}

			if (i == 3) {
				rgba[i] = parseInt(rgba[i]).toString(16);
			}
		}

		return rgba.join('').toUpperCase();
	}
}

function hsl(): string {
	throw new Error('Function not implemented.');
}
function hsv(): string {
	throw new Error('Function not implemented.');
}
