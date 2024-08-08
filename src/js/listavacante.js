const { ipcRenderer } = require('electron');

let allVacantes = [];

async function fetchVacantes() {
    try {
        const vacantes = await ipcRenderer.invoke('get-all-vacantes');
        allVacantes = vacantes;  // Almacenar globalmente para búsqueda
        renderVacantes(vacantes);
    } catch (error) {
        console.error('Error al obtener vacantes:', error);
    }
}

// Delegación de eventos para manejar dinámicamente los clics en botones dentro de la tabla
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterVacantes);

    document.getElementById('vacantes-table').addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            const id = event.target.getAttribute('data-id');
            if (event.target.classList.contains('edit-btn')) {
                openEditModal(id);
            } else if (event.target.classList.contains('delete-btn')) {
                deleteVacante(id);
            }
        }
    });

    fetchVacantes();
});

function filterVacantes() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const filteredVacantes = allVacantes.filter(vacante =>
        Object.values(vacante).some(value =>
            String(value).toLowerCase().includes(search)
        )
    );
    renderVacantes(filteredVacantes);
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
                <button class="edit-btn" data-id="${vacante._id}">Editar</button>
                <button class="delete-btn" data-id="${vacante._id}">Eliminar</button>
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
        document.getElementById('edit-tipo-contrato').value = vacante.tipoContrato;
        document.getElementById('edit-observaciones').value = vacante.observaciones;
        document.getElementById('edit-id').value = id;
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar la vacante para editar:', error);
        //Swal.fire('Error al cargar la vacante para editar..');
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
        tipoContrato: document.getElementById('edit-tipo-contrato').value,
        observaciones: document.getElementById('edit-observaciones').value
    };

    try {
        await ipcRenderer.invoke('update-vacante', id, updatedVacante);
        alert('Vacante actualizada exitosamente');
        closeEditModal();
        fetchVacantes();
    } catch (error) {
        console.error('Error al actualizar la vacante:', error);
        alert('Error al actualizar la vacante');
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
        console.error('Error al eliminar la vacante:', error);
        alert('Error al eliminar la vacante. Ver consola para más detalles.');
    }
}
