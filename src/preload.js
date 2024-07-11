
const { contextBridge } = require('electron');
console.log('Cargando preload.js');
 // Exposición de la API al mundo del renderizado

try {
    console.log("ENTRE PARA VERIFICAR AUTENTICACION");
    const { validarUsuario } = require('./autenticacion');
    console.log('Módulo autenticacion.js cargado correctamente.');
    contextBridge.exposeInMainWorld('electronAPI', {
         validarUsuario
    });
} catch (error) {
    console.error('Error al cargar autenticacion.js:', error);
}

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector);
        if (element) element.innerText = text;
    }

    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, process.versions[type]);
    }
});

/*
const { contextBridge } = require('electron');
const connectDB = require('./conexion.js'); // Asegúrate de que la ruta sea correcta

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
*/