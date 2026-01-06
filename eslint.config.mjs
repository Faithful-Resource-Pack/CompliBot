import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig(eslint.configs.recommended, tseslint.configs.recommended, {
	rules: {
		"@typescript-eslint/no-require-imports": "off",
		// pretty much all any uses are needed because discord.js sucks
		"@typescript-eslint/no-explicit-any": "off",
	},
});
