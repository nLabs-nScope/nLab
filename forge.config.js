module.exports = {
  packagerConfig: {
    asar: true,
    osxSign: {
      identity: "84Z8NUVVD8",
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
      config: {},
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
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
