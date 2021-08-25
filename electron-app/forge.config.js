/* eslint-disable */
const path = require('path');

module.exports = {
  packagerConfig: {
    arch: 'x64',
    platform: 'win32',
    dir: '.',
    out: 'release-app',
    icon: path.resolve(__dirname, './icon.ico'),
    overwrite: true,
  },
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Accedia',
          name: 'fit-ccc-input-automation',
        },
      },
    },
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        authors: 'Full Impact Technologies',
        name: 'FitCCCInputAutomation',
        exe: 'FIT CCC Input Automation.exe',
        iconUrl: path.resolve(__dirname, './icon.ico'),
        setupExe: 'FIT CCC Input Automation.exe',
        noMsi: true,
      },
    },
  ],
};
