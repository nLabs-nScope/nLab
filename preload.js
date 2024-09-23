window.electron_log = require('electron-log');
window.electron_log.transports.console.level = false;
const log = electron_log.scope("preload");
log.info("starting preload");

const { ipcRenderer } = require('electron');
window.ipcRenderer = ipcRenderer;

window.nlab = require('./app/nlab.node');
log.info("loaded native node module");

window.nLab = nlab.newNscope();
log.info("created new nLab");