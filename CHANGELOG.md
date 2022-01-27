# Changelog

## TypeScript rewrite (date TBA)

### Major changes:
- Full rewrite from JavaScript to TypeScript (who would've thought)
- Much more organised and cleaner codebase
- Slash commands (where possible)

### Minor changes:
- now using the translation file "en-US.json" for all slash commands
- added language system, translations now happen based on the user's discord language *(although only en-US has full coverage)
- added a `/cstats` command which displays the uses of a specific command
- improved error logging, which will help us fix bugs faster in the future
- added a `/tm` or `/tileAndMagnify` command which magnifies and tiles at the same time
- improved the detection of various images in image specific commands
- `/mute` command now uses Discord's timeout feature
- ~~(finally) added the `/poll` command back~~ removed by Juknum, to be re-inplemented
- added a `/license` command for the Compliance Resource Pack license
- various changes and tweaks to existing commands