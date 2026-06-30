const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('researchApi', {
  init: () => ipcRenderer.invoke('app:init'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  runResearch: (product, engineMode) => ipcRenderer.invoke('research:run', { product, engineMode }),
  listReports: (search) => ipcRenderer.invoke('reports:list', search),
  getReport: (reportId) => ipcRenderer.invoke('reports:get', reportId),
  deleteReport: (reportId) => ipcRenderer.invoke('reports:delete', reportId),
  onProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('research:progress', listener);
    return () => ipcRenderer.removeListener('research:progress', listener);
  }
});
