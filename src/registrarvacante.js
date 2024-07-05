// src/registrarvacante.js
document.addEventListener('DOMContentLoaded', function () {
    console.log("API Disponible:", window.electronAPI);  // Verifica si la API está realmente disponible.
  
    const form = document.querySelector('form');
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
  
      const formData = {
        clavePresupuestal: document.getElementById('clave-presupuestal').value,
        municipio: document.getElementById('municipio').value,
        claveCT: document.getElementById('clave-ct').value,
        localidad: document.getElementById('localidad').value,
        funcion: document.getElementById('funcion').value,
        fechaInicio: document.getElementById('fecha-inicio').value,
        motivo: document.getElementById('motivo').value,
        fechaFin: document.getElementById('fecha-fin').value,
        nombreEscuela: document.getElementById('nombre-escuela').value,
        perfilRequerido: document.getElementById('perfil-requerido').value,
        turno: document.getElementById('turno').value,
        estatus: document.getElementById('estatus').value,
        tipoContrato: document.querySelector('input[name="tipo-contrato"]:checked').value,
        observaciones: document.getElementById('observaciones').value
      };
  
      if (window.electronAPI) {
        try {
          const docId = await window.electronAPI.addVacancy(formData);
          console.log('Vacante registrada con éxito, ID:', docId);
          alert('Vacante registrada con éxito!');
          form.reset();
        } catch (error) {
          console.error('Error al registrar la vacante:', error);
          alert('Error al registrar la vacante: ' + error.message);
        }
      } else {
        console.error("La API de Electron no está disponible.");
      }
    });
  });
  

  