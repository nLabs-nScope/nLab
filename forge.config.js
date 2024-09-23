module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/assets/icons/nLabApp_Icon',
    appBundleId: 'com.getnlab.nlabapp',
    osxSign: {
      identity: "W74MCWRPFC",
      hardenedRuntime: true,
    },
    osxNotarize: {
      tool: 'notarytool',
      appleId: process.env.MACOS_NOTARIZATION_APPLE_ID,
      appleIdPassword: process.env.MACOS_NOTARIZATION_PWD,
      teamId: process.env.MACOS_NOTARIZATION_TEAM_ID
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        setupExe: 'nLab Installer.exe',
        loadingGif: 'src/assets/gif/installing.gif',
        iconUrl: 'https://www.nscope.org/user/pages/icons/nLabApp_Icon.ico',
        setupIcon: 'src/assets/icons/nLabApp_Icon.ico',
        signWithParams: `/csp "DigiCert Software Trust Manager KSP" /kc key_847858243 /f ${process.env.CODE_SIGNING_CERT_FILE} /tr http://timestamp.digicert.com /td SHA256 /fd SHA256`
      },
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        icon: 'src/assets/icons/nLabApp_Icon.icns',
        name: 'nLab Installer',
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
    {
      name: '@electron-forge/maker-zip',
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
