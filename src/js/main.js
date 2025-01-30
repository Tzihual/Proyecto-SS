// src/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const connectDB = require('./conexion');
require('dotenv').config();



function createWindow() {
    const win = new BrowserWindow({
        width: 1350,
        height: 1150,
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: false,
            nodeIntegration: true
        }
    });

    win.loadFile('src/html/index.html');
  // win.webContents.openDevTools();
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
        console.log('Conectando a la base de datos...');
        const db = await connectDB();
        console.log('Conexión exitosa. Insertando datos...');
        const result = await db.collection('vacante').insertOne(formData);
        console.log('Datos insertados con éxito:', result.insertedId);
        return result.insertedId;
    } catch (error) {
        console.error('Error al registrar la vacante:', error);
        throw new Error('No se pudo registrar la vacante');
    }
});


ipcMain.handle('get-paginated-vacantes', async (event, { page = 1, limit = 10, filter = {} }) => {
    try {
        const db = await connectDB();
        const skip = (page - 1) * limit;

        // Construimos el filtro dinámico según lo que envíe el frontend
        let query = {};

        if (filter.nivelEducativo && filter.nivelEducativo !== "Todos") {
            query.nivelEducativo = filter.nivelEducativo;
        }

        if (filter.tipoContrato && filter.tipoContrato !== "Todos") {
            query.tipoContrato = filter.tipoContrato;
        }

        if (filter.searchText) {
            const regex = new RegExp(filter.searchText, "i"); // Insensitive search
            query.$or = [
                { clavePresupuestal: regex },
                { claveCT: regex },
                { municipio: regex },
                { nombreEscuela: regex },
                { nivelEducativo: regex }
            ];
        }

        // Ejecutamos la consulta con el filtro dinámico
        const vacantes = await db.collection('vacante')
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();

        const total = await db.collection('vacante').countDocuments(query);

        return {
            vacantes: vacantes.map(vacante => ({
                ...vacante,
                _id: vacante._id.toString()
            })),
            total
        };
    } catch (error) {
        console.error('Error al obtener vacantes con filtro:', error);
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

ipcMain.handle('get-report-data', async (event, { startDate, endDate }) => {
    try {
        const db = await connectDB();
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Convert the date to ISO format strings for comparison
        const startISO = start.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const endISO = end.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        console.log(`Fetching reports from ${startISO} to ${endISO}`);
        // Query for records where fechaRegistro is within the date range
        const reportData = await db.collection('vacante').find({
            fechaRegistro: {
                $gte: startISO,
                $lte: endISO
            }
        }).toArray();
        return reportData;
    } catch (error) {
        console.error('Error al obtener los datos del reporte:', error);
        throw error;
    }
});
