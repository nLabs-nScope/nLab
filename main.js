'use strict'
if(process.env.NSCOPE_SMOKE_TEST === '1') {
    process.stdout.write("Running smoke test... ")
    process.on('uncaughtException', e => {
        process.stdout.write(" Fail\n")
        process.stdout.write(e.message)
        process.stdout.write(e.stack)
        app.exit(1)
    })
}
const electron = require('electron')
const app = electron.app
if (require('electron-squirrel-startup')) app.quit();
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const BrowserWindow = electron.BrowserWindow

const icon = electron.nativeImage.createFromPath(path.join(__dirname, 'app/assets/icons/icon_256x256.png'));

if (!app.isPackaged) {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    });
}


app.setName(config.productName)

if (process.platform === "darwin") {
    app.dock.setIcon(icon);
}
var mainWindow = null
app.on('ready', function () {
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
            devTools: true, //!app.isPackaged,
            contextIsolation: false,
        }
    })


    mainWindow.loadURL(`file://${__dirname}/nscope.html`)

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null)
        mainWindow.show()
    })

    // Open the DevTools.
    const isDebug = typeof process.argv.find(item => item === 'debug') !== 'undefined';
    // if (isDebug) {
        mainWindow.openDevTools();
    // }
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