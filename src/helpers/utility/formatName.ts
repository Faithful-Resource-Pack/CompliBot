/**
 * Format a pack ID into a displayable name and icon
 * @author Evorp
 * @param pack pack to format
 * @param size optionally specify size of image
 * @todo migrate this to somewhere better for extensibility (api probably)
 * @returns formatted string and icon in that order
 */
export default function formatName(pack: string, size = "512"): [string, string] {
	let strPack: string;
	let strIconURL = `https://database.faithfulpack.net/images/branding/logos/transparent/${size}/`;
	switch (pack) {
		case "faithful_32x":
			strPack = "Faithful 32x";
			strIconURL += "f32_logo.png";
			break;
		case "faithful_64x":
			strPack = "Faithful 64x";
			strIconURL += "f64_logo.png";
			break;
		case "classic_faithful_32x":
			strPack = "Classic Faithful 32x Jappa";
			strIconURL += "cf32_logo.png";
			break;
		case "classic_faithful_32x_progart":
			strPack = "Classic Faithful 32x Programmer Art";
			strIconURL += "cf32pa_logo.png";
			break;
		case "classic_faithful_64x":
			strPack = "Classic Faithful 64x";
			strIconURL += "cf64_logo.png";
			break;
		case "progart":
			strPack = "Default Programmer Art";
			// have to redefine since root directory is different
			strIconURL = `https://database.faithfulpack.net/images/bot/progart.png?w=${size}`;
			break;
		default:
			strPack = "Default Jappa";
			strIconURL = `https://database.faithfulpack.net/images/bot/default.png?w=${size}`;
			break;
	}
	return [strPack, strIconURL];
}
