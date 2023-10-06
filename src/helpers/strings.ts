import commands from "@/lang/en-US/commands.json";
import errors from "@/lang/en-US/errors.json";

export const JSONFiles = ["commands", "errors"];
export const en_US = { ...commands, ...errors };

/**
 * @important
 * If Discord adds a language, what should I do?
 * - [Add it to workflow file on crowdin](https://faithful.crowdin.com/u/projects/4/workflow)
 * - [Update the language list below using](https://discord.com/developers/docs/reference#locales)
 * - [Update mapping on crowdin](https://faithful.crowdin.com/u/projects/4/apps/system/github) (select the branch > edit branch configuration > edit file filter > language mapping)
 */