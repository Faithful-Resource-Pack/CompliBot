# Translation guide
*A guide on how to translate for complibot*

## Contributing to a language
To contribute to an existing language, first check `lang/README.md` to see if it has been completed. If it is not at 100%, there are translations missing from the language file.
To add these translations, find the language's `.json` file and copy keys from `en-US.json` into the language's file and replace the english text with one corresponding to your language

Should you want to have your work be attributed to you, write your name at the start of `_CONTRIBUTORS` key like so:
```
    "_CONTRIBUTORS": [ "your name here", "other people here", "oldest contributor here" ],
```
All thats left to do once you translated a few (or all of the) keys is to run `npm run genLang` in a terminal (and make sure you are in the same directory as this file) to generate `lang/README.md` with correct coverage of your language.

_The language readme will soon generate on push once i figure out how to use workflows lol_

## Supporting a new language
To create a new `.json` file, first look at `lang/README.md` and find the country code (e.g en-US => en-US.json) corresponding with your language (Capitalization matters, use en-US.json not en-us.json for instance) then follow the steps above.
