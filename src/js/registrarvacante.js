// src/registrarvacante.js
document.addEventListener('DOMContentLoaded', function () {
  const { ipcRenderer } = window.require('electron');

  const nivelEducativo = document.getElementById('nivel-educativo');
  const materiasSecundariaContainer = document.getElementById('materias-secundaria-container');
  const materiasSecundaria = document.getElementById('materias-secundaria');
  const horasSecundariaContainer = document.getElementById('horas-secundaria-container'); 
  const detalleMateriaContainer = document.getElementById('detalle-materia-container'); // Nuevo campo para especificar el tipo
  const detalleMateria = document.getElementById('detalle-materia');

  const motivoSelect = document.getElementById('motivo');
  const otroMotivoContainer = document.createElement('div'); // Crear un contenedor para el input de otro motivo
  otroMotivoContainer.innerHTML = `
    <label for="otro-motivo">Especifique el motivo</label>
    <input type="text" id="otro-motivo">
  `;
  otroMotivoContainer.style.display = 'none'; // Ocultar al inicio
  motivoSelect.parentNode.appendChild(otroMotivoContainer); // Agregarlo debajo del select de motivos


  // Ocultar el combo de materias al inicio
  materiasSecundariaContainer.style.display = 'none';
  horasSecundariaContainer.style.display = 'none'; 
  detalleMateriaContainer.style.display = 'none'; 

  nivelEducativo.addEventListener('change', function () {
    if (nivelEducativo.value === 'Secundaria tecnicas' || nivelEducativo.value === 'Secundaria generales') {
      materiasSecundariaContainer.style.display = 'block';
      horasSecundariaContainer.style.display = 'block'; // Agregar esto
      materiasSecundaria.setAttribute('required', 'required');
      detalleMateriaContainer.style.display = 'none';
    } else {
      materiasSecundariaContainer.style.display = 'none';
      horasSecundariaContainer.style.display = 'none'; // Agregar esto
      materiasSecundaria.removeAttribute('required');
    }
  });
  materiasSecundaria.addEventListener('change', function () {
    if (materiasSecundaria.value === 'Artes' || materiasSecundaria.value === 'Tecnologias') {
      detalleMateriaContainer.style.display = 'block';
      detalleMateria.setAttribute('required', 'required');
    } else {
      detalleMateriaContainer.style.display = 'none';
      detalleMateria.removeAttribute('required');
    }
  });

  motivoSelect.addEventListener('change', function () {
    if (motivoSelect.value === 'alta') { 
      otroMotivoContainer.style.display = 'block';
      document.getElementById('otro-motivo').setAttribute('required', 'required');
    } else {
      otroMotivoContainer.style.display = 'none';
      document.getElementById('otro-motivo').removeAttribute('required');
    }
  });
  const form = document.querySelector('form');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      Swal.fire({
        icon: 'error',
        title: 'Error..',
        text: 'Por favor, verifica que todos los campos estén correctamente llenados.'
      });
      return;
    }
    let fechaLocal = new Date().toISOString().split('T')[0];
    const formData = {
      clavePresupuestal: document.getElementById('clave-presupuestal').value,
      municipio: document.getElementById('municipio').value,
      claveCT: document.getElementById('clave-ct').value,
      localidad: document.getElementById('localidad').value,
      funcion: document.getElementById('funcion').value,
      fechaInicio: document.getElementById('fecha-inicio').value,
      motivo: motivoSelect.value === 'alta' ? otroMotivoContainer.value : motivoSelect.value,
      fechaFin: document.getElementById('fecha-fin').value,
      nombreEscuela: document.getElementById('nombre-escuela').value,
      perfilRequerido: document.getElementById('perfil-requerido').value,
      turno: document.getElementById('turno').value,
      estatus: document.getElementById('estatus').value,
      nivelEducativo: document.getElementById('nivel-educativo').value,
      materiaSecundaria: materiasSecundariaContainer.style.display === 'none' ? null : materiasSecundaria.value,
      horasSecundaria: materiasSecundariaContainer.style.display === 'none' ? null : document.getElementById('horas-secundaria').value, 
      detalleMateria: detalleMateriaContainer.style.display === 'none' ? null : detalleMateria.value, // Agregar esto
      zonaEconomica: document.getElementById('zona-economica').value,
      tipoContrato: document.querySelector('input[name="tipo-contrato"]:checked').value,
      observaciones: document.getElementById('observaciones').value,
      fechaRegistro: fechaLocal
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
      detalleMateriaContainer.style.display = 'none';
      otroMotivoContainer.style.display = 'none';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al registrar la vacante: ' + error.message
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', function () {
  const nombreUsuario = localStorage.getItem('usuario');
  if (nombreUsuario) {
    document.getElementById('nombre-usuario').textContent = nombreUsuario;
  }
});


