# CompliBot TypeScript - Changelog
> This is a beta and will not be fully stable. To report any bugs, use the `/feedback` command

## How to read this changelog?

Commands are explained like so:
```
/notes [mandatory_parameter] (optional_parameter)
```

## [v2.0.4] TBA

### Added
- You can now search for a texture without using underscores `_`

### Changed

- The CompliBot ascii art now show up & show up with different colors when `tokens.maintenance === true`

## [v2.0.3] 12/04/2022

### Added
- `/activity [activity] (channel)` lets you start all of discord's mini-games in a channel that your in or a specified channel can be provided. (_some activities require boosts like the game octo_) 
- `/stats command (command)` now returns 10 most used commands by default, you can still see per command by specifying the `command` option.
- `/eval [code]` command for developers.
- `/logs` for developers only, see the whole current logs information without needing a crash of the bot.
- `/notes [add|list|edit]`, moderators can now make private notes against all users
  - Use `/notes list [user]` to list all attached notes from that user; **⚠️ the response is public**.
  - Use `/notes add [user] [note]` to add a note to a user
  - Use `/notes edit [user] [index] (note)` to edit a specific note, administrators can modify any notes, but moderators can only modify their personal notes. If the `note` parameter is not given **and** you're an administrator, the note is deleted.
- `/userinfo` for moderators to get detailed information on a specified user
- `/todo [add|remove]`, council can now add or remove from the todo list - a channel like rules that mimics the todo doc. Note: this is meant to be automated with the submission system but the manual commands will remain for fixes
  - `/todo add [entity|block|item|misc] [texture_id] (parent) (reason)` Add an entry to a category by itself with a reason or add it to a parent or make a new parent with a reason and append it to that.
  - `/todo remove [entity|block|item|misc] [texture_id]` unimplemented as of 12/04/2022.
  
### Changed
- Re-branded Compliance to Faithful.
- Changed how no results are handled when using `/texture`, may solve the `Unknown Message` error + the no response at all.
- Crash logs are now **way more** detailed and now contain information about: messages (deleted/created), slash commands, guild member (joined/removed), select menus, buttons, slash commands, guild joined (when the client is added to a guild: ⚠️ UNTESTED)
- `/poll`:
  - Threads are now directly attached to the poll message
  - Vote can now be set to accept multiple answers trough the `allow-multiple-answer` option! (set to `false` by default)
  - You now receive a message when you add/remove a vote to an anonymous vote
  - Fixed possible crash/unhandledError when too much text is displayed inside the vote field (for not anonymous votes)
- Changed emojis for the buttons of the `/feedback` command
- Added texture path version to the texture select menu (avoid confusion between exact same path & name for a texture, ex: `gold_ore`)

### Fixed
- Slash command permissions not working properly
- Delete button should now be properly working again
- Fixed some typo & added a lot of comments to describe methods/functions

## [v2.0.2] 14/03/2022

### Added
- `/bean [user]` will now beans a user (moderators exclusive).
- `/restart` to restarts the bot process for maintenance (bot developers exclusive) 
- `/botban [view|audit]` **⚠️ Being bot banned disables use of any interaction and should be used only to patch exploiting users.**
  - `/botban view [format]` command: view the bot ban list in various formats (bot developers exclusive)
  - `/botban audit [subject] (pardon)` command: add/remove a user from the bot ban list (bot developers exclusive)
- `/changelog` command: Show the changelog by version.
- `/notice` command: Give the users updates on stuff like scheduled downtime
- `/setnotice` command: Sets the current notice (bot developers exclusive).
- A beautiful Ascii art showing up when the bot starts.
- Easy to use timeout value when making a poll with `/poll`.
- `/modping (urgent)` command: used to pings moderators when you needs direct help from them.
- `/mute [user] [time] (reason)` command: Mute the given user for the given period of time (moderators exclusive).
- `/clear [amount]` command: Clear the given amount of message (moderators exclusive).
- Added 2 ~~super secret~~ commands for devs fun & amusement only.
- A view votes button has been added on submitted textures, thus, only giving output while the texture is still in the submission process.
- **Config:** added "teams" config options: This now allow us to specify global roles, channels and so on for a group of discords servers (useful for Faithful servers).

### Changed
- ⚠️ Moved all `.json` files used to store data from `EmittingCollection` into `./json/dynamic`
  > All polls data already saved will be lost! Already saved data needs to be manually transferred (only path as changed, not the data itself).
- ⚠️ Commands in the `faithful` folders are now only available on `faithful`, `faithful_extra` & `classic_faithful` servers;  
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
- `/missing` command (for all faithful packs) [Dungeons 32x NYI]
- `/palette` command & button command
- Submission system (Push & Contribution creation NYI)

### Changed
- Improved message quoting for messages with file attachments

### Fixed
- Fixed non deletable interaction: `this interaction is reserved to Bot` :)

---
## [v2.0.0] 21/02/2022

### Added

- Slash commands (replacing normal commands)
- Buttons and selection menus (replacing reactions)
- Native translations based on Discord language
- `/stats command` command to see the amount of uses of a specific command
- `/license` command for the Faithful Resource Packs license
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
