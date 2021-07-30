# FIT CCC Input Automation

## Description 

The app takes control of the user’s keyboard and uses it to automatically populate data into CCC Estimating system. The input data for the application for now is downloaded as .json file from the FIT Rev website and then uploaded manually into the application. The program runs only on windows 64bit machine for the time being.

## Setup

### Install
- run `npm i`
- run `./node_modules/.bin/electron-rebuild` to rebuild everything

### Run development

- run `npm run dev` in one terminal, which runs
  - typescript compiler & watcher for electron TS
  - create-react-app dev server
- run `npm run electron` in another terminal, which runs
  - `electron .` on the compiled files
  - ⚠ This has to be restarted on every change in `/electron-app` so the electron uses the latest compiled files

### Build for prod

- run `npm run build` from electron-app
