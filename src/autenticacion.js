
// src/autenticacion.js

const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI2; // Asegúrate de tener esta variable en tu .env
const client = new MongoClient(uri);
console.log('Cargando autenticacion.js');
async function validarUsuario(username, password) {
    try {
        await client.connect();
        console.log("ENTRE A LA CONEXION BD")
        const database = client.db("Proyecto-Vacante");
        const usuarios = database.collection("usuario");
        console.log("ENTRE A LA BDDDD")
        const query = { usuario: username, contraseña: password };
        const user = await usuarios.findOne(query);
                return user !== null;
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        return false;
    } finally {
        await client.close();
    }
}
module.exports = { validarUsuario };

/*
const { contextBridge } = require('electron');
const connectDB = require('./conexion');

async function validarUsuario(username, password) {
    try {
        const db = await connectDB();
        const collection = db.collection("usuario"); // Asegúrate que el nombre de la colección sea correcto
        const usuario = await collection.findOne({ username: username, password: password });
        return usuario !== null; // Retorna true si el usuario existe
    } catch (error) {
        console.error('Error al buscar el usuario:', error);
        return false;
    }
}


contextBridge.exposeInMainWorld('electronAPI', {
    validarUsuario
});

module.exports = validarUsuario;

*/