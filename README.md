![develop version](https://img.shields.io/badge/dynamic/json?color=blue&label=develop&prefix=v&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2FAccedia%2Frev-clone-pad%2Fdevelop%2Fpackage.json)
![master version](https://img.shields.io/badge/dynamic/json?color=blue&label=master&prefix=v&query=%24.version&url=https%3A%2F%2Fraw.githubusercontent.com%2FAccedia%2Frev-clone-pad%2Fmaster%2Fpackage.json)
![Bump](https://github.com/Accedia/rev-clone-pad/actions/workflows/bump.yml/badge.svg)
![Release](https://github.com/Accedia/rev-clone-pad/actions/workflows/release.yml/badge.svg)

# REV Clone Pad

## Description

The app handles forgettable data, cloned from within REV Portal. It populates a modal with the received data, and allows copying of values, based on the forgettable operation. The copied values can then be pasted into CCC One.

## Usage

Navigate to `./electron-app` folder.

### Install

- Run `npm install` in the project root.

### Run development

- Run `npm start` in the project root

- After a change in the server code is made, you need to type `rs` in the terminal to restart the application

### Production

## Build

- **`npm run package`** - creates a portable executable, which can be run directly.
- **`npm run make`** - runs  `package` internally and creates a setup file from the generated files, which can be distributed after.
- **`npm run publish`** - runs `package` and `make` internally, after which it pushes the installable to a release server. In this case it is called from a CI workflow which runs on `main` branch and the files are automatically added to the latest release.

## Publish

There are two CI/CD jobs that run on `develop` and `master`.

- **BUMP workflow** - runs on every push to `develop` and bumps the package.json version and creates a GitHub tag with respective version.
  - _MAJOR or major_ keyword in commit message - bumps the major version `X.0.0` (the X)
  - _MINOR or minor_ keyword in commit message - bumps the minor version `0.X.0` (the X)
  - no keywords - bumps the patch version `0.0.X` (the X)
- **RELEASE workflow** - runs on every push to `main`. This job builds the latest version of the app and adds its make files to the respective (latest) tag. The release is saved as a draft, and to make it public you need to go the the release in the [releases](https://github.com/Accedia/force-import-technology/releases) section and manually save it.
- uses **FORGE_TOKEN** as env variable, which has to be set in the repository secrets section. This secret is your accounts GITHUB_TOKEN and allows the workflow to upload the releases to GitHub.

## Auto Update

The app checks for updates from the GitHub API for the latest release and downloads it locally in a TEMP folder (if the version is higher than the currently installed). Then installs it and restarts the app to apply the updates. Uses the electron built-in `autoUpdater` with some queries to the GitHub API.

## Logs

The application writes logs in the following locations:

- on Linux: `~/.config/REV Clone Pad/logs/{process type}.log`
- on macOS: `~/Library/Logs/REV Clone Pad/{process type}.log`
- on Windows: `%USERPROFILE%\AppData\Roaming\REV Clone Pad\logs\{process type}.log`