module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/assets/icons/nscope_icon',
    osxSign: {
      identity: "W74MCWRPFC",
      hardenedRuntime: true,
        // optionsForFile: (filePath) => {
        //     // Here, we keep it simple and return a single entitlements.plist file.
        //     // You can use this callback to map different sets of entitlements
        //     // to specific files in your packaged app.
        //     return {
        //         entitlements: 'entitlements.plist'
        //     };
        // }
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupExe: 'nScope Installer.exe',
        loadingGif: 'src/assets/gif/installing.gif',
        iconUrl: 'https://www.nscope.org/user/pages/icons/nscope_icon.ico',
        setupIcon: 'src/assets/icons/nscope_icon.ico'
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        icon: 'src/assets/icons/nscope_icon.icns',
        name: 'nScope Installer',
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
