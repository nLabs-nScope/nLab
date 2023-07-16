module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'icons/nscope_icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupIcon: 'icons/nscope_icon.ico'
      },
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
