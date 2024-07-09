// src/conexion.js
const { MongoClient } = require('mongodb');
require('dotenv').config();  // Asegúrate de cargar las variables de entorno

let dbConnection;

async function connectDB() {
    if (!dbConnection) {
        const client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        console.log("Conectado a MongoDB Atlas");
        dbConnection = client.db("Proyecto-Vacante");
    }
    return dbConnection;
}

module.exports = connectDB;
