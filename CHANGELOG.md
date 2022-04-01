# CompliBot TypeScript - Changelog
> This is a beta and will not be fully stable. To report any bugs, use `/feedback`

## [v2.0.3] TBA

### Changed
- Changed emojis for the buttons of the `/feedback` command
- Added texture path version to the texture select menu (avoid confusion between exact same path & name for a texture, ex: `gold_ore`)

### Fixed
- Delete button should now be properly working again
- Fixed some typo & added a lot of comments to describe methods/functions

## [v2.0.2] 14/03/2022

### Added
- Added `/bean <user>` command: beans a user (moderators exclusive).
- Added `/restart` command: restarts the bot process for maintanance (bot owners exclusive) 
- Added `/botban view <format>` command: view the botban list in various formats (bot owners exclusive)
- Added `/botban audit <subject> <pardon?>` command: add/remove a user from the botban list (bot owners exclusive)
- ⚠️ Being botbanned disables use of any interaction and should be used only to patch exploiting users
- Added `/changelog` command: Show the changelog by version.
- Added `/notice` command: Give the users updates on stuff like scheduled downtime
- Added `/setnotice` command: Sets the current notice (bot owners exclusive).
- A beautiful Ascii art showing up when the bot starts.
- Added easy to use timeout value when making a poll with `/poll`.
- Added `/modping <urgent?>` command: used to pings moderators when you needs direct help from them.
- Added `/mute <user> <time> <reason?>` command: Mute the given user for the given period of time (moderators exclusive).
- Added `/clear <amount>` command: Clear the given amount of message (moderators exclusive).
- Added 2 ~~super secret~~ commands for devs fun & amusement only.
- A view votes button has been added on submitted textures, thus, only giving output while the texture is still in the submission process.
- **Config:** added "teams" config options: This now allow us to specify global roles, channels and so on for a group of discords servers (useful for Compliance & Co servers).

### Changed
- ⚠️ Moved all `.json` files used to store data from `EmittingCollection` into `./json/dynamic`
  > All polls data already saved will be lost! Already saved data needs to be manually transferred (only path as changed, not the data itself).
- ⚠️ Commands in the `compliance` folders are now only available on `compliance`, `compliance_extra` & `classic_faithful` servers;  
  > Concerned commands are: `/guidelines`, `/license`, `/missing`, `/reason`, `/texture`, `/website`.  
  > To avoid duplicated commands, kick & reinvite the bot.
- Added some textures to the `blacklisted_textures.json`.
- Messed up with the config to remove everything that was useless & compact everything else into their respective categories

### Fixed
- Images buttons are now back on `/texture` embed when there is only 1 result.
- Images buttons have been tweaked to be only present when the operations is possible/logic.
- Fixed `polls` being automatically marked as "ended" while no timeout was given.
- Fixed `/texture` command erroring when there are multiple texture results and a texture having no path set

## [v2.0.1] 05/03/2022

### Added
- `/poll` command
- `/missing` command (for all compliance/classic faithful packs) [Dungeons 32x NYI]
- `/palette` command & button command
- Submission system (Push & Contribution creation NYI)

### Changed
- Improved message quoting for messages with file attachments

### Fixed
- Fixed undeletable interaction: `this interaction is reserved to Bot` :)

---
## [v2.0.0] 21/02/2022

### Added

- Slash commands (replacing normal commands)
- Buttons and selection menus (replacing reactions)
- Native translations based on Discord language
- `/stats command` command to see the amount of uses of a specific command
- `/license` command for the Compliance Resource Pack license
- Lots of new easter eggs

### Changed

- Tile command now has a random option to mimic minecraft texture randomization,
`flip` behaves like stone; randomly flips textures. `rotate`
randomly rotates textures at 90° intervals; behaves like i.e. moss.
Random options can be applied to all patterns
- `/mute` command now uses Discord's timeout feature
- Image searching for all image commands now can follow reply chains to the original image. Perfect for long discussions about textures.
- Image commands now support many new Discord image types, especially for embeds
- Better feedback command, reports will now be sorted into bugs and suggestions which is easier for us devs but also provides a chance to preview your feedback before submitting it
- Improved message quoting and added ptb.discord.com as valid quote link
- Improved error logging, which will help us fix bugs faster in the future
- Various changes, tweaks and enhancements to all commands