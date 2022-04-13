const { contextBridge } = require('electron')
const nscope = require('./app/nscope.node')

contextBridge.exposeInMainWorld('native', {
    nscope
})