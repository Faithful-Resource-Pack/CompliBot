import { readFileSync } from "fs";
import path from "path";

export type key = typeof rawKeys;
//reads the keys from .keys and adds them
const rawKeys = readFileSync(path.join(__dirname, "../../lang/.keys"), 'utf-8').split('\n').slice(1).join('\n').replaceAll(/(\n|\r)/, "").split(",");
export default key;
