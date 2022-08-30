/* eslint-disable */
const path = require('path');
const packageJson = require('./package.json');

const iconPath = path.resolve(__dirname, './assets/icon-white-bg.ico');

module.exports = {
  packagerConfig: {
    arch: 'x64',
    platform: 'win32',
    dir: '.',
    out: 'out',
    icon: iconPath,
    overwrite: true,
  },
  packagerConfig: {},
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        authToken: process.env.FORGE_TOKEN,
        repository: {
          owner: 'Accedia',
          name: 'rev-clone-pad',
        },
        draft: false,
      },
    },
  ],
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      platforms: ['win32'],
      config: {
        authors: 'Full Impact Technologies',
        name: 'rev_clone_pad',
        exe: 'Rev Clone Pad.exe',
        iconUrl: iconPath,
        setupIcon: iconPath,
        setupExe: `REV Clone Pad Setup ${packageJson.version}.exe`,
        noMsi: true,
      },
    },
  ],
  plugins: [
    [
      "@electron-forge/plugin-webpack",
      {
        mainConfig: "./webpack.main.config.js",
        renderer: {
          config: "./webpack.renderer.config.js",
          entryPoints: [
            {
              html: "./src/ui/main/index.html",
              js: "./src/ui/main/index.tsx",
              name: "main",
              preload: {
                js: "./src/preload.ts"
              }
            },
            {
              html: "./src/ui/loading/index.html",
              js: "./src/ui/loading/index.tsx",
              name: "loading"
            }
          ]
        }
      }
    ]
  ]
};
