@echo off
taskkill /IM node.exe /F & node --use_strict --trace-warnings index.js