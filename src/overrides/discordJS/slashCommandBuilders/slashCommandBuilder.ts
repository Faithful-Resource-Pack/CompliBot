import { Mixin } from 'ts-mixer';
import { SlashCommandBuilder } from 'discord.js';
import { SlashCommon } from '.';

export class LocalizedSlashCommandBuilder extends Mixin(SlashCommandBuilder, SlashCommon(new SlashCommandBuilder())) {
  constructor() {
    super();
    this.setDMPermission(false); // Default to guild only
  }

  /**
   * Sets if the command is available in DMs with the application, only for globally-scoped commands.
   * ~~By default, commands are visible.~~
   *
   * **Extended version: By default, commands are not visible.**
   *
   * @param enabled - If the command should be enabled in DMs
   * @see https://discord.com/developers/docs/interactions/application-commands#permissions
   */
  setDMPermission(enabled: boolean | null | undefined): this {
    return super.setDMPermission(enabled);
  }
}
