import { AnyPack } from "@interfaces/firestorm";

/**
 * Format a pack ID into a displayable name and icon
 * @author Evorp
 * @param pack pack to format
 * @param size optionally specify size of image
 * @todo migrate this to somewhere better for extensibility (api probably)
 * @returns formatted string and icon in that order
 */
export default function formatPack(pack: AnyPack, size = "512") {
	let name: string;
	let iconURL = `https://database.faithfulpack.net/images/branding/logos/transparent/${size}/`;
	switch (pack) {
		case "faithful_32x":
			name = "Faithful 32x";
			iconURL += "f32_logo.png";
			break;
		case "faithful_64x":
			name = "Faithful 64x";
			iconURL += "f64_logo.png";
			break;
		case "classic_faithful_32x":
			name = "Classic Faithful 32x Jappa";
			iconURL += "cf32_logo.png";
			break;
		case "classic_faithful_32x_progart":
			name = "Classic Faithful 32x Programmer Art";
			iconURL += "cf32pa_logo.png";
			break;
		case "classic_faithful_64x":
			name = "Classic Faithful 64x";
			iconURL += "cf64_logo.png";
			break;
		case "progart":
			name = "Default Programmer Art";
			// have to redefine since root directory is different
			iconURL = `https://database.faithfulpack.net/images/bot/progart.png?w=${size}`;
			break;
		default:
			name = "Default Jappa";
			iconURL = `https://database.faithfulpack.net/images/bot/default.png?w=${size}`;
			break;
	}
	return { name, iconURL };
}
