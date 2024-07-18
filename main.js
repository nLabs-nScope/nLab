'use strict'
if(process.env.NSCOPE_SMOKE_TEST === '1') {
    process.stdout.write("Running smoke test... ")
    process.on('uncaughtException', e => {
        process.stdout.write(" Fail\n")
        process.stdout.write(e.message)
        process.stdout.write(e.stack)
        process.exit(1)
    })
}
const path = require('path')

const electron_log = require('electron-log');
electron_log.transports.console.level = false;
electron_log.initialize();

const log = electron_log.scope("main");
const log_directory = path.dirname(electron_log.transports.file.getFile().path);
log.info(`nScope main process start from: ${process.cwd()}`);

require('update-electron-app')()
const electron = require('electron')
const app = electron.app
if (require('electron-squirrel-startup')) app.quit();
const config = require(path.join(__dirname, 'package.json'))
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu

const icon = electron.nativeImage.createFromPath(path.join(__dirname, 'app/assets/icons/icon_256x256.png'));

app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('log-file', path.join(log_directory, 'js.log'));
log.info('completed importing requirements');
if (!app.isPackaged) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}


app.setName(config.productName)
Menu.setApplicationMenu(null)

if (process.platform === "darwin") {
    app.dock.setIcon(icon);
}
var mainWindow = null
log.info('configured application branding');

app.on('ready', function () {
    log.info('creating application window ...');
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 720,
        minHeight: 400,
        title: config.productName,
        show: false,
        icon: icon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            devTools: !app.isPackaged,
            contextIsolation: false,
            nodeIntegration: true,
        }
    })



    mainWindow.loadURL(`file://${__dirname}/nscope.html`)
    log.info('completed window creation');

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null)
        mainWindow.show()
        log.info('completed main window ready-to-show');
    })

    // Open the DevTools.
    const isDebug = typeof process.argv.find(item => item === 'debug') !== 'undefined';
    if (isDebug) {
        log.info('debug mode detected, showing dev tools');
        mainWindow.openDevTools();
    }
    // Prevent zooming
    // let webContents = mainWindow.webContents;
    // webContents.on('did-finish-load', () => {
    //     webContents.setZoomFactor(1);
    //     webContents.setVisualZoomLevelLimits(1, 1);
    //     webContents.setLayoutZoomLevelLimits(0, 0);
    // });

    mainWindow.onbeforeunload = (e) => {
        // Prevent Command-R from unloading the window contents.
        e.returnValue = false
    }
    mainWindow.on('closed', function () {
        log.info('application window closed, quitting');
        app.quit()
    })
})

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event) => {
        event.preventDefault()
    })
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' }
    })
    log.info('completed main window web-contents-created');
})

app.on('ready', (event, contents) => {
    if(process.env.NSCOPE_SMOKE_TEST === '1'){
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            process.stdout.write(" Fail\n")
            process.stdout.write(errorDescription)
            app.exit(1)
        })
        process.stdout.write(" Complete\n")
        app.quit()
    }
})