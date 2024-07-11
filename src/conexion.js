const { MongoClient } = require('mongodb');
require('dotenv').config();
let dbConnection;

async function connectDB() {
    try {
        if (!dbConnection) {
            const client = new MongoClient(process.env.MONGODB_URI2);
            await client.connect();
            console.log("Conectado a MongoDB Atlas");
            dbConnection = client.db("Proyecto-Vacante");
        }
        return dbConnection;
    } catch (error) {
        console.error("Error al conectar a MongoDB Atlas:", error);
        throw error;  // O maneja el error según sea necesario
    }
}
module.exports = connectDB;

