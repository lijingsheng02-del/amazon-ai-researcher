const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('researchApi', {
  init: () => ipcRenderer.invoke('app:init'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  fetchAmazonProduct: (url) => ipcRenderer.invoke('amazon:fetchProduct', url),
  runResearch: (product, engineMode) => ipcRenderer.invoke('research:run', { product, engineMode }),
  listReports: (search) => ipcRenderer.invoke('reports:list', search),
  getReport: (reportId) => ipcRenderer.invoke('reports:get', reportId),
  deleteReport: (reportId) => ipcRenderer.invoke('reports:delete', reportId),
  renameReport: (reportId, title) => ipcRenderer.invoke('reports:rename', reportId, title),
  exportReportExcel: (reportId) => ipcRenderer.invoke('reports:exportExcel', reportId),
  onProgress: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('research:progress', listener);
    return () => ipcRenderer.removeListener('research:progress', listener);
  }
});
