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
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        authors: 'Full Impact Technologies',
        name: 'FitCCCInputAutomation',
        exe: 'FIT CCC Input Automation.exe',
        iconUrl: path.resolve(__dirname, './icon.ico'),
        setupExe: 'FIT CCC Input Automation.exe',
        noMsi: false,
        setupMsi: 'Install FIT CCC Input Automation.msi',
      },
    },
  ],
};
