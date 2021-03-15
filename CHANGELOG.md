# CompliBot Changelog
---------------------------------------
### March 2021

#### March 14th 2021
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