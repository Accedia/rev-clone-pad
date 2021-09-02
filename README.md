# FIT CCC Input Automation

## Description 

The app takes control of the user’s keyboard and uses it to automatically populate data into CCC Estimating system. The input data for the application for now is downloaded as .json file from the FIT Rev website and then uploaded manually into the application. The program runs only on windows 64bit machine for the time being.

## Usage

Navigate to `./electron-app` folder.

### Install
- run `npm i` (this has to be run in `./react-app` as well)
- run `npm run rebuild` to rebuild everything

### Run development

- run `npm run dev` in one terminal, which runs
  - typescript compiler & watcher for electron TS
  - create-react-app dev server
- run `npm start` in another terminal, which runs
  - After a change in the `electron-app` folder is made, you need to type `rs` in the terminal to restart the application

### Production

## Build

- **`npm run build` from *./electron-app* folder** - compiles the TypeScript files into JS files and creates a production build for the react application
- **`npm run package` from *./electron-app* folder** - runs `build` internally and after which it packages the electron app into executable which can be run.
- **`npm run make` from *./electron-app* folder** - runs `build` and `package` internalli and after which it creates an installable file which can be distributed.
- **`npm run publish` from *./electron-app* folder** - runs `build`, `package` and `make` after which it pushes the installable to a releases server. In our case this is called from a CI which runs on `master` branch and the files are automatically added to the latest release.

## Publish

There are two CI/CD jobs that run on `develop` and `master`. 
- **BUMP workflow** - runs on every push to `develop` and bumps the package.json version and creates a GitHub tag with respective version. 
  - *MAJOR or major* keyword in commit message - bumps the major version `X.0.0` (the X)
  - *MINOR or minor* keyword in commit message - bumps the minor version `0.X.0` (the X)
  - no keyworrds - bumps the patch version `0.0.X` (the X)
- **RELEASE workflow** - runs on every push to `master`. This job builds the latest version of the app, adds it's make files to the respective (latest) tag. The release is saved as a draft, and to make it public you need to go the the release in the [releases](https://github.com/Accedia/fit-ccc-input-automation/releases) section and manually save it.
  - uses **FORGE_TOKEN** as env variable, which has to be set in the repository secrets section. This secret is your accounts GITHUB_TOKEN and allows the workflow to upload the releases to GitHub.

## Auto Update

The app checks for updates from the GitHub API for the latest release and downloads it locally in a TEMP folder (if the version is higher than the currently installed). Then installs it and restarts the app to apply the updates. Uses the electron built-in `autoUpdater` with some queries to the GitHub API.


## Logs

The application writes logs in the following locations:
on Linux: `~/.config/FIT CCC Input Automation/logs/{process type}.log`
on macOS: `~/Library/Logs/FIT CCC Input Automation/{process type}.log`
on Windows: `%USERPROFILE%\AppData\Roaming\FIT CCC Input Automation\logs\{process type}.log`
