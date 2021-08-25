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
        authToken: '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',
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
