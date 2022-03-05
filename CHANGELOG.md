# CompliBot TypeScript - Changelog
> This is a beta and will not be fully stable. To report any bugs, use `/feedback`

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

---
## Planned

> Note: These are not the full changelogs, more entries will be added in the future.

#### [v2.1.0]
- full implementation of missing commands
- slash command image attachments (we are waiting on discord.js v14 or v13.7 to drop)
#### [v2.2.0]
- mute and unmute taking advantage of new timeouts
- warns offenders can see
- immutable audit log for all punishments viewed by mods and admins
#### [release] 
- End of "Complibot Beta", will be reincarnated as "Complibot" and the old will become the new

_"Yea but wen [version] release?"_ - we don't know.
