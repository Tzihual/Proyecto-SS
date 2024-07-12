// src/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const connectDB = require('./conexion');

function createWindow() {
    const win = new BrowserWindow({
        width: 1500,
        height: 1300,
        webPreferences: {
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

ipcMain.handle('add-vacancy', async (event, formData) => {
    try {
        const db = await connectDB();
        const result = await db.collection('vacante').insertOne(formData);
        return result.insertedId;
    } catch (error) {
        console.error('Error al agregar la vacante:', error);
        throw error;
    }
});

