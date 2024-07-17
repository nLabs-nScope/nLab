const electron_log = require('electron-log');
const log = electron_log.scope("preload");
log.info("starting preload");
window.nscope = require('./app/nscope.node');
log.info("loaded native node module");
window.nScope = nscope.newNscope();
log.info("created new nScope");