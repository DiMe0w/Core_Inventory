const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      contextIsolation: true,                     // Включаем изоляцию контекста
      nodeIntegration: false,                     // Отключаем Node.js в renderer процессе
      enableRemoteModule: false,                  // Убедитесь, что remote отключен
    },
  });

  mainWindow.loadFile('./frontend/index.html');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {

    app.quit();
  }
});