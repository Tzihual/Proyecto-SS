// src/registrarvacante.js
document.addEventListener('DOMContentLoaded', function () {
  const { ipcRenderer } = window.require('electron');
  
  const nivelEducativo = document.getElementById('nivel-educativo');
  const materiasSecundariaContainer = document.getElementById('materias-secundaria-container');
  const materiasSecundaria = document.getElementById('materias-secundaria');

  // Ocultar el combo de materias al inicio
  materiasSecundariaContainer.style.display = 'none';
  materiasSecundaria.required = false;  // Initially not required

  nivelEducativo.addEventListener('change', function () {
    if (nivelEducativo.value === 'Secundaria') {
      materiasSecundariaContainer.style.display = 'block';
      materiasSecundaria.required = true;
    } else {
      materiasSecundariaContainer.style.display = 'none';
      materiasSecundaria.required = false;
      materiasSecundaria.value = ''; // Clear the value when not needed
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      alert('Por favor, verifica que todos los campos estén correctamente llenados.');
      return;
    }

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
      nivelEducativo: document.getElementById('nivel-educativo').value,
      materiaSecundaria: materiasSecundariaContainer.style.display === 'none' ? null : materiasSecundaria.value,
      zonaEconomica: document.getElementById('zona-economica').value,
      tipoContrato: document.querySelector('input[name="tipo-contrato"]:checked').value,
      observaciones: document.getElementById('observaciones').value
    };

    try {
      const docId = await ipcRenderer.invoke('add-vacancy', formData);
      console.log('Vacante registrada con éxito, ID:', docId);
      alert('Vacante registrada con éxito!');
      form.reset();
    } catch (error) {
      console.error('Error al registrar la vacante:', error);
      alert('Error al registrar la vacante: ' + error.message);
    }
  });
});
