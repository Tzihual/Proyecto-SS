// src/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const connectDB = require('./conexion');

function createWindow() {
    const win = new BrowserWindow({
        width: 1500,
        height: 1300,
        webPreferences: {
          //  preload: path.join(__dirname, 'preload.js'), 
            contextIsolation: false,
            enableRemoteModule: false,
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, 'index.html'));
    win.webContents.openDevTools();

     // Conectar a MongoDB cuando la ventana esté lista
     win.webContents.on('did-finish-load', async () => {
        try {
            const db = await connectDB();
            console.log('Se conectó a MongoDB Atlas.');
        } catch (error) {
            console.error('Error conectando a MongoDB Atlas:', error);
        }
    });
    
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
