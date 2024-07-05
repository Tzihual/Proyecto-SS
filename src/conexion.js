// src/conexion.js
const { contextBridge } = require('electron');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

// Asegúrate de que este mensaje aparezca en la consola de la aplicación
console.log("Preload script loaded");

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC4rDs6Vu_yXqJXG4CbIWmuHK3id5bPVn0",
  authDomain: "proyecto-ss-c9c5c.firebaseapp.com",
  projectId: "proyecto-ss-c9c5c",
  storageBucket: "proyecto-ss-c9c5c.appspot.com",
  messagingSenderId: "866768326630",
  appId: "1:866768326630:web:ab56e0eec797d7a6f51027",
  measurementId: "G-WJ4V28BG66"
};

// Inicializar la aplicación Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

contextBridge.exposeInMainWorld('electronAPI', {
  addVacancy: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'vacantes'), data);
      console.log("Documento añadido con ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error al añadir documento:', error);
      throw error;
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});
