window.electron_log = require('electron-log');
window.electron_log.transports.console.level = false;
const log = electron_log.scope("preload");
log.info("starting preload");

window.nscope = require('./app/nscope.node');
log.info("loaded native node module");

window.nScope = nscope.newNscope();
log.info("created new nScope");