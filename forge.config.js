module.exports = {
    packagerConfig: {
        asar: true,
        icon: 'src/assets/icons/nscope_icon',
        appBundleId: 'org.nscope.nscopeapp',
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupExe: 'nScope Installer.exe',
                loadingGif: 'src/assets/gif/installing.gif',
                iconUrl: 'https://www.nscope.org/user/pages/icons/nscope_icon.ico',
                setupIcon: 'src/assets/icons/nscope_icon.ico',
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

if (process.env.NSCOPE_CODESIGN) {
    module.exports.packagerConfig.osxNotarize = {
        tool: 'notarytool',
        appleId: process.env.MACOS_NOTARIZATION_APPLE_ID,
        appleIdPassword: process.env.MACOS_NOTARIZATION_PWD,
        teamId: process.env.MACOS_NOTARIZATION_TEAM_ID
    }
    module.exports.packagerConfig.osxSign = {
        identity: "W74MCWRPFC",
        hardenedRuntime: true,
    }
    module.exports.makers[0].config.signWithParams = `/csp "DigiCert Software Trust Manager KSP" /kc key_847858243 /f ${process.env.CODE_SIGNING_CERT_FILE} /tr http://timestamp.digicert.com /td SHA256 /fd SHA256`
}
