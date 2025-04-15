const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  // Load React app from Vite's dev server or built files
  const devServerURL = 'http://localhost:5173'; // Change this if your Vite dev server uses a different port
  mainWindow.loadURL(devServerURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// Handle the folder picker request
ipcMain.handle('open-directory-dialog', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths[0] || null; // Return folder path or null if canceled
});

// Add new IPC handler for switching CNN models
ipcMain.handle('switch-cnn-model', async (event, modelId) => {
  // ... rest of the handler code from my previous response
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
