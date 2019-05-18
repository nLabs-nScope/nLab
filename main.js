'use strict'

const electron = require('electron')
const app = electron.app
const path = require('path')
const config = require(path.join(__dirname, 'package.json'))
const BrowserWindow = electron.BrowserWindow
const nScopeAPI = require(path.resolve('app/js/nScopeAPI'));

require('electron-reload')(__dirname);

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.setName(config.productName)
var mainWindow = null
app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        minWidth: 640,
        minHeight: 400,
        title: config.productName,
        show: false,
        icon: path.join(__dirname, 'assets/icons/png/256x256.png'),
        webPreferences: {
            nodeIntegration: true,
            defaultEncoding: 'UTF-8'
        }
    })
    console.log("Platform: " + require('process').platform+ "  Arch: "+ require('process').arch);
    mainWindow.loadURL(`file://${__dirname}/app/index.html`)

    mainWindow.once('ready-to-show', () => {
        mainWindow.setMenu(null)
        mainWindow.show()
    })

    // mainWindow.webContents.openDevTools();

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
        nScopeAPI.close();
        nScopeAPI.clean();
        mainWindow = null
    })
})

app.on('window-all-closed', () => { app.quit() })