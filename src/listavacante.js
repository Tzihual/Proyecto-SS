// src/listavacante.js
const { ipcRenderer } = require('electron');

async function fetchVacantes() {
    try {
        const vacantes = await ipcRenderer.invoke('get-all-vacantes');
        renderVacantes(vacantes);
    } catch (error) {
        console.error('Error fetching vacantes:', error);
    }
}

function renderVacantes(vacantes) {
    const tbody = document.querySelector('#vacantes-table tbody');
    tbody.innerHTML = '';

    vacantes.forEach(vacante => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${vacante.clavePresupuestal}</td>
            <td>${vacante.claveCT}</td>
            <td>${vacante.municipio}</td>
            <td>${vacante.nombreEscuela}</td>
            <td>${vacante.nivelEducativo}</td>
            <td>${vacante.tipoContrato}</td>
            <td>
                <button onclick="openEditModal('${vacante._id}')">Editar</button>
                <button onclick="deleteVacante('${vacante._id}')">Eliminar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

async function openEditModal(id) {
    try {
        const vacante = await ipcRenderer.invoke('get-vacante', id);
        document.getElementById('edit-clave-presupuestal').value = vacante.clavePresupuestal;
        document.getElementById('edit-municipio').value = vacante.municipio;
        document.getElementById('edit-clave-ct').value = vacante.claveCT;
        document.getElementById('edit-localidad').value = vacante.localidad;
        document.getElementById('edit-funcion').value = vacante.funcion;
        document.getElementById('edit-fecha-inicio').value = vacante.fechaInicio;
        document.getElementById('edit-motivo').value = vacante.motivo;
        document.getElementById('edit-fecha-fin').value = vacante.fechaFin;
        document.getElementById('edit-nombre-escuela').value = vacante.nombreEscuela;
        document.getElementById('edit-perfil-requerido').value = vacante.perfilRequerido;
        document.getElementById('edit-turno').value = vacante.turno;
        document.getElementById('edit-estatus').value = vacante.estatus;
        document.getElementById('edit-nivel-educativo').value = vacante.nivelEducativo;
        document.getElementById('edit-zona-economica').value = vacante.zonaEconomica;
        document.getElementById('edit-observaciones').value = vacante.observaciones;
        document.getElementById('edit-id').value = id;

        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error loading vacante for edit:', error);
        alert('Error loading vacante for edit. See console for details.');
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

async function saveEdit() {
    const id = document.getElementById('edit-id').value;
    const updatedVacante = {
        clavePresupuestal: document.getElementById('edit-clave-presupuestal').value,
        municipio: document.getElementById('edit-municipio').value,
        claveCT: document.getElementById('edit-clave-ct').value,
        localidad: document.getElementById('edit-localidad').value,
        funcion: document.getElementById('edit-funcion').value,
        fechaInicio: document.getElementById('edit-fecha-inicio').value,
        motivo: document.getElementById('edit-motivo').value,
        fechaFin: document.getElementById('edit-fecha-fin').value,
        nombreEscuela: document.getElementById('edit-nombre-escuela').value,
        perfilRequerido: document.getElementById('edit-perfil-requerido').value,
        turno: document.getElementById('edit-turno').value,
        estatus: document.getElementById('edit-estatus').value,
        nivelEducativo: document.getElementById('edit-nivel-educativo').value,
        zonaEconomica: document.getElementById('edit-zona-economica').value,
        observaciones: document.getElementById('edit-observaciones').value
    };

    try {
        await ipcRenderer.invoke('update-vacante', id, updatedVacante);
        alert('Vacante actualizada exitosamente');
        closeEditModal();
        fetchVacantes();
    } catch (error) {
        console.error('Error updating vacante:', error);
        alert('Error updating vacante. See console for details.');
    }
}

async function deleteVacante(id) {
    try {
        const confirmed = confirm('¿Estás seguro de que deseas eliminar esta vacante?');
        if (!confirmed) {
            return;
        }

        const success = await ipcRenderer.invoke('delete-vacante', id);
        if (success) {
            alert('Vacante eliminada exitosamente');
            fetchVacantes();
        } else {
            alert('Error al eliminar la vacante');
        }
    } catch (error) {
        console.error('Error deleting vacante:', error);
        alert('Error deleting vacante. See console for details.');
    }
}

document.addEventListener('DOMContentLoaded', fetchVacantes);

