const path = require('path');
const { MakerBase } = require('@electron-forge/maker-base');

class MakerAppImage extends MakerBase {
    name = 'appimage';
    defaultPlatforms = ['linux'];

    isSupportedOnCurrentPlatform() {
        return true;
    }

    async make(options) {
        const { buildForge } = require('app-builder-lib');
        return buildForge(options, { linux: [`appimage:${options.targetArch}`] });
    }
}

module.exports = {
    packagerConfig: {
        asar: true,
        icon: 'src/assets/icons/nLabApp_Icon',
        appBundleId: 'org.nscope.nscopeapp',
        extraResource: ['packaging/99-nlab.rules'],
    },
    rebuildConfig: {},
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                setupExe: 'nLab Installer.exe',
                loadingGif: 'src/assets/gif/installing.gif',
                iconUrl: 'https://raw.githubusercontent.com/nLabs-nScope/nLab/main/src/assets/icons/nLabApp_Icon.ico',
                setupIcon: 'src/assets/icons/nLabApp_Icon.ico',
            },
        },
        {
            name: '@electron-forge/maker-dmg',
            config: {
                format: 'ULFO',
                icon: 'src/assets/icons/nLabApp_Icon.icns',
                name: 'nLab Installer',
            },
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: 'src/assets/icons/nLabApp_Icon_512x512@2x.png',
                    scripts: {
                        postinst: "packaging/postinstall.sh"
                    }
                }
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    icon: 'src/assets/icons/nLabApp_Icon_512x512@2x.png',
                    scripts: {
                        post_install: "packaging/postinstall.sh"
                    }
                }
            }
        },
        new MakerAppImage({
            options: {
                icon: 'src/assets/icons/nLabApp_Icon_512x512@2x.png',
            }
        }),
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

if (process.env.NLAB_CODESIGN) {
    console.log("Configuring Electron Forge to Codesign")

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
    if (process.platform === 'win32') {
        const certId = process.env.DIGICERT_CERTIFICATE_ID?.trim();
        const certFile = process.env.CODE_SIGNING_CERT_FILE?.trim();
        if (!certId) {
            throw new Error('DIGICERT_CERTIFICATE_ID must be set when NLAB_CODESIGN is enabled on Windows');
        }
        if (!certFile) {
            throw new Error('CODE_SIGNING_CERT_FILE must be set when NLAB_CODESIGN is enabled on Windows');
        }
        const keyAlias = certId.startsWith('key_') ? certId : `key_${certId}`;
        const normalizedCertFile = path.win32.normalize(certFile);
        const certSha1 = process.env.CODE_SIGNING_CERT_SHA1?.trim();
        const certSelector = certSha1 ? `/sha1 ${certSha1}` : '/a';
        module.exports.makers[0].config.signWithParams = `/csp "DigiCert Software Trust Manager KSP" /kc ${keyAlias} /f "${normalizedCertFile}" ${certSelector} /tr http://timestamp.digicert.com /td SHA256 /fd SHA256`;
    }
}


