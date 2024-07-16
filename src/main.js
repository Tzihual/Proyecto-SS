// src/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

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
        return result.insertedId;  // Devuelve el ID del documento insertado
    } catch (error) {
        console.error('Error al registrar la vacante:', error);
        throw new Error('No se pudo registrar la vacante');
    }
});


ipcMain.handle('get-all-vacantes', async () => {
    try {
        const db = await connectDB();
        const vacantes = await db.collection('vacante').find().toArray();
        return vacantes.map(vacante => ({
            ...vacante,
            _id: vacante._id.toString()
        }));
    } catch (error) {
        console.error('Error al obtener todas las vacantes:', error);
        throw error;
    }
});

ipcMain.handle('get-vacante', async (event, id) => {
    try {
        const db = await connectDB();
        const vacante = await db.collection('vacante').findOne({ _id: new ObjectId(id) });
        return vacante;
    } catch (error) {
        console.error('Error al obtener la vacante:', error);
        throw error;
    }
});

ipcMain.handle('delete-vacante', async (event, id) => {
    try {
        const db = await connectDB();
        const result = await db.collection('vacante').deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (error) {
        console.error('Error al eliminar la vacante:', error);
        throw error;
    }
});

ipcMain.handle('update-vacante', async (event, id, updateData) => {
    try {
        const db = await connectDB();
        const result = await db.collection('vacante').updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        return result.modifiedCount > 0;
    } catch (error) {
        console.error('Error al actualizar la vacante:', error);
        throw error;
    }
});
