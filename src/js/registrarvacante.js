// src/registrarvacante.js
document.addEventListener('DOMContentLoaded', function () {
  const { ipcRenderer } = window.require('electron');

  const nivelEducativo = document.getElementById('nivel-educativo');
  const materiasSecundariaContainer = document.getElementById('materias-secundaria-container');
  const materiasSecundaria = document.getElementById('materias-secundaria');
  const horasSecundariaContainer = document.getElementById('horas-secundaria-container'); // Agregar esto

  // Ocultar el combo de materias al inicio
  materiasSecundariaContainer.style.display = 'none';
  horasSecundariaContainer.style.display = 'none'; // Agregar esto

  nivelEducativo.addEventListener('change', function () {
    if (nivelEducativo.value === 'Secundaria') {
      materiasSecundariaContainer.style.display = 'block';
      horasSecundariaContainer.style.display = 'block'; // Agregar esto
      materiasSecundaria.setAttribute('required', 'required');
    } else {
      materiasSecundariaContainer.style.display = 'none';
      horasSecundariaContainer.style.display = 'none'; // Agregar esto
      materiasSecundaria.removeAttribute('required');
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Por favor, verifica que todos los campos estén correctamente llenados.'
      });
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
      horasSecundaria: materiasSecundariaContainer.style.display === 'none' ? null : document.getElementById('horas-secundaria').value, // Nuevo campo
      zonaEconomica: document.getElementById('zona-economica').value,
      tipoContrato: document.querySelector('input[name="tipo-contrato"]:checked').value,
      observaciones: document.getElementById('observaciones').value,
      fechaRegistro: new Date()
    };

    try {
      const docId = await ipcRenderer.invoke('add-vacancy', formData);
      Swal.fire({
        icon: 'success',
        title: 'Registrado',
        text: 'Vacante registrada con éxito!'
      });
      form.reset();
      materiasSecundariaContainer.style.display = 'none';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al registrar la vacante: ' + error.message
      });
    }
  });
});


