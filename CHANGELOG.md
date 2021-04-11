# CompliBot Changelog
---------------------------------------
### April 2021

#### April 11th 2021
> Juknum

- Split download & push process into 2 Cron functions, like that, if the download failed (fetcherror or anything), the push would still be made.
- Reduce the max limit of `GetMessages.js` from 500 to 200. (there is still less than 200 textures/day, but just in case).

#### April 9th 2021
> Juknum

- Added a specific rules for the CompliBot Discord dev server : no rules.
- Removed old unused stuff from the `rules.js` file. 

> RobertR11

- removed the need for a factor in the `/magnify` command
- removed the embeds in the `/magnify`, `/tile` and `/animate` command
- added the changelog that I forgot before lol

#### April 6th 2021
> Juknum

- Removed unused files.
- `/help` now works with aliases.

> RobertR11

- Added examples to various commands
- Made emoji reactions much faster
- Added bot uptime to the `/info` command
- Removed some client events that we aren't using
- Use client username instead of hardcoded name on embeds
- Removed CompliBot footer on submission embeds, because it kinda feels out of place
- Added inline replies

### March 2021

#### March 30th 2021
> Juknum

- Fixed `/contributor` command, now works properly, now use flags.
- Fixed contributor adding inside texture process (need to be verified).
- Modified fallback channel from `#private` to `#council-talk`.

#### March 29th 2021
> Juknum

- Rewritted the `rules.js` and make a `/rules <n>` command to show the `n` asked rule. Old but gold, the previous `/rules` has been moved to `/rules all`, **now moderators can use it**.
- Date format from `date.js` has been updated, now `dd/mm/yyyy` instead of `mm/dd/yyyy`.
- Added `/instapass <message url>` to instapass texture directly to GitHub (by-pass council process), can be executed by Moderators only.
- Modified & adapted `strings.js` to recent changes.

#### March 28th 2021
> Juknum

- Added previous image support for the `/animate` command.
- The `/animate` command now support frametime & custom frames order parameters.
- The flag `--mcmeta` from the `/animate` command have been renamed to `--custom`.
- A new flag `--mcmeta` (that's why the other one have been renamed) is used to search trough the `/contributors/java.json` & `/contributors/bedrock.json` to find mcmeta from the given string.
- Fixed `/mute` crash when no time was given.
- Removed `settings.C3D_SUBMIT` & submission process because the channel have been removed.

#### March 27th 2021
> Juknum

- Added the `/animate` command! Type `/help animate` to see what it does!
	- With the `--mcmeta` flag, can be set to true to send custom mcmeta settings.
- Removed `/command` & `command.js` (unused)


#### March 25th 2021
> Juknum

- Revamp `/push` command :
	Args can now be swapped.
	Args can now have space.
	Better code writted.
- Moved `push.js` to `./moderators`

#### March 18th 2021
> RobertR11

- added 21w11a support to the `/texture` command

#### March 17th 2021
> RobertR11

- moved all command descriptions to `strings.js`
- small `/info` command improvements
- added a `/feedback` command

#### March 15th 2021
> RobertR11 & Domi04151309

- start working on translating

> RobertR11

- removed the `messages.js` file, because it was already moved somewhere else a long time ago
- started moving more messages to `strings.js` but reverted most stuff because it broke the bot

#### March 14th 2021
> Juknum

- Fixed non pushing to bedrock thing (old version supported (1.16.200 instead of 210))

#### March 13th 2021
> Juknum

- Finally updated bedrock.json format
- Added author from java textures to bedrock textures (if a bedrock counter part exist)
- Modified `GetResults.js` to automatically push java texture that are also on bedrock. This will also add author to bedrock textures.

#### March 5th 2021
> RobertR11

- fix `/mute` command not working at all
- fix `/magnify`, `/tile` and `/palette` command giving errors when not finding any image in previous 10 messages

### February 2021

#### February 27th 2021
> Juknum

- Move `date()` into it's own file (`functions/utility/date.js`);
- Improve code indentation & move some file into subfolders.

#### February 26th 2021
> RobertR11

- added 21w06a support for `/texture` command
- fix typo in `/tile` command
- move invite detection to its own file
- improve spelling in the `/texture` command description

#### February 20th 2021
> RobertR11

- check if the user's message still exists on various commands to avoid discord api errors
- revert the palette command limit to 256x256, because it was too much for the bot

#### February 19th 2021
> RobertR11

- check if command is guild only for every command
- added 21w07a support for `/texture` command
- changed tile and palette limit to 512x512 (previously 256x256) so it's like the magnify limit
- fixed the bot not showing the full arg or showing "undefined" in the tiling message

#### February 18th 2021
> RobertR11

- added reaction when texture gets into council vote

#### February 17th 2021
> RobertR11

- added a size limit of 256x256 to the `/palette` command

#### February 16th 2021
> RobertR11

- disable mentioning "everyone" or "here" in any way
- start working on `/quote` command (currently disabled)

#### February 15th 2021
> RobertR11

- simplify `/tile` command (also tried to add message and image url back, but didn't work)

#### February 14th 2021 (Happy Valentin's day btw)
> Juknum

- Added jpg & jpeg support for quotation system, added discordapp.com url support.
- Modified `/tile` command: removed url/id/message url functionality (unused) & added parameters; You can now tile an image vertically & horizontally, round & plus shape, grid shape is still used by default, type `/help tile` for more information. Also made `/t` an alias for this command.
- Started to work on a `/render` command.

#### February 11th 2021
> Juknum

- Added `/autopush` command, act the same way as GetResults.js, but it can be now executed manually
- Added `/profile` command, used to translate Discord ID into username, usefull for the website Gallery.
- Added `/hotfix` command, basically a `/test` command but with a better name.

#### February 10th 2021
> RobertR11

- Ignore various moderation commands when in dm's
- Prevent crash when trying to magnify or tile corrupted images
- Add 21w06a texture support

#### February 9th 2021
> Juknum

- Contributors java & bedrock now use discord ID instead of discord Tag
- Contributors Java is now ready to downgrade C32 & C64 from 1.17 to 1.12.2
- Updated /about, /texture, /push commands following the new contributors format

#### February 8th 2021
> Juknum  

- Introducing Changelog
- Fixed wrong copper block name from /contributors/java.json
- Fixed /about command
---------------------------------------