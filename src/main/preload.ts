// Give ipcRenderer-module access to the renderer without enabling the node integration.
window.ipcRenderer = require('electron').ipcRenderer

export {}
