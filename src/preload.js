// src/preload.js
const { contextBridge } = require('electron');
const connectDB = require('./conexion'); // Asegúrate de que la ruta sea correcta

async function validarUsuario(username, password) {
    try {
        const db = await connectDB();
        const collection = db.collection("usuario");
        const usuario = await collection.findOne({ usuario: username, contraseña: password });
        return usuario !== null;
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        return false;
    }
}

contextBridge.exposeInMainWorld('electronAPI', {
    validarUsuario
});
