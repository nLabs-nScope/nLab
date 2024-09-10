'use strict'
if (process.env.NSCOPE_SMOKE_TEST === '1') {
    process.stdout.write("Running smoke test... ")
    process.on('uncaughtException', e => {
        process.stdout.write(" Fail\n")
        process.stdout.write(e.message)
        process.stdout.write(e.stack)
        process.exit(1)
    })
}
const electron_log = require('electron-log');
const fs = require('fs');
const path = require('path');
electron_log.transports.console.level = false;
if (process.env.NSCOPE_LOG === 'trace') {
    electron_log.transports.file.level = 'debug';
} else {
    electron_log.transports.file.level = 'info';
}

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

    // Listen for the screenshot request
    electron.ipcMain.handle('save-data', async (channel, data) => {
        const documentsPath = app.getPath('documents');
        const dirName = path.join(documentsPath, 'nScope_Captures');
        fs.mkdirSync(dirName, {recursive: true});

        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

        const filenamePrefix = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}.${milliseconds}`;
        const imagePath = path.join(dirName, `${filenamePrefix}.png`);
        const csvPath = path.join(dirName, `${filenamePrefix}.csv`);


        const image = await mainWindow.capturePage();
        const buffer = image.toPNG();
        fs.writeFileSync(imagePath, buffer);
        log.info('Screenshot saved to:', imagePath);

        if (data) {
            let csv_data = data[0].map((_, colIndex) => data.map(row => row[colIndex]));
            let csv = csv_data.map(row => row.map(cell => {
                return (cell && cell.toFixed) ? `${cell.toFixed(7)}` : `${cell}`
            }).join(",")).join("\n");
            fs.writeFileSync(csvPath, csv);
            log.info('CSV saved to:', csvPath);
        }
        return path.join(dirName, filenamePrefix);
    });

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
        return {action: 'deny'}
    })
    log.info('completed main window web-contents-created');
})

app.on('ready', (event, contents) => {
    if (process.env.NSCOPE_SMOKE_TEST === '1') {
        mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
            process.stdout.write(" Fail\n")
            process.stdout.write(errorDescription)
            app.exit(1)
        })
        process.stdout.write(" Complete\n")
        app.quit()
    }
})