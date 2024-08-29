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
// Cuando se seleccione el nivel educativo en el filtro, mostrar/ocultar columnas relevantes
document.getElementById('filter-nivel').addEventListener('change', function() {
    const selectedNivel = this.value;

    if (selectedNivel === 'Secundaria') {
        document.querySelectorAll('.materia-column, .horas-column').forEach(column => {
            column.style.display = 'table-cell';
        });
    } else {
        document.querySelectorAll('.materia-column, .horas-column').forEach(column => {
            column.style.display = 'none';
        });
    }

    filterReport(selectedNivel);
});

function filterReport(nivel) {
    const filteredVacantes = allVacantes.filter(vacante =>
        nivel === 'Todos' || vacante.nivelEducativo === nivel
    );
    renderVacantes(filteredVacantes);

    if (nivel === 'Secundaria') {
        document.querySelectorAll('.materia-column').forEach(column => {
            column.style.display = 'table-cell';
        });
    } else {
        document.querySelectorAll('.materia-column').forEach(column => {
            column.style.display = 'none';
        });
    }
}
function renderVacantes(vacantes) {
    const tbody = document.querySelector('#vacantes-table tbody');
    tbody.innerHTML = ''; // Limpiar el cuerpo de la tabla antes de agregar nuevas filas

    vacantes.forEach(vacante => {
        const tr = document.createElement('tr');
        let materiaColumn = vacante.nivelEducativo === 'Secundaria' ? `<td>${vacante.materiaSecundaria || 'N/A'}</td>` : '<td>N/A</td>';

        tr.innerHTML = `
            <td>${vacante.clavePresupuestal}</td>
            <td>${vacante.claveCT}</td>
            <td>${vacante.municipio}</td>
            <td>${vacante.nombreEscuela}</td>
            <td>${vacante.nivelEducativo}</td>
            ${materiaColumn}
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
        document.getElementById('edit-zona-economica').value = vacante.zonaEconomica;
        document.getElementById('edit-tipo-contrato').value = vacante.tipoContrato;
        document.getElementById('edit-observaciones').value = vacante.observaciones;
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nivel-educativo').value = vacante.nivelEducativo;
        if (vacante.nivelEducativo === 'Secundaria') {
            document.getElementById('secundaria-fields').style.display = 'block';
            document.getElementById('edit-materias-secundaria').value = vacante.materiaSecundaria; // Ajustar valores predeterminados según corresponda
            document.getElementById('edit-horas-secundaria').value = vacante.horasSecundaria; // Ajustar valores predeterminados
        } else {
            document.getElementById('secundaria-fields').style.display = 'none';
        }
        document.getElementById('editModal').style.display = 'block';
    } catch (error) {
        Swal.fire(
            'Error!',
            'Error al cargar la vacante para editar: ' + error.message,
            'error'
        );
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

    // Agregar campos de Materia y Horas si el nivel educativo es 'Secundaria'
    if (document.getElementById('edit-nivel-educativo').value === 'Secundaria') {
        updatedVacante.materiaSecundaria = document.getElementById('edit-materias-secundaria').value;
        updatedVacante.horasSecundaria = document.getElementById('edit-horas-secundaria').value;
    }

    try {
        const success = await ipcRenderer.invoke('update-vacante', id, updatedVacante);
        if (success) {
            Swal.fire(
                'Actualizado!',
                'La vacante ha sido actualizada exitosamente.',
                'success'
            );
            closeEditModal();
            fetchVacantes();
        } else {
            Swal.fire(
                'Error!',
                'No se pudo actualizar la vacante.',
                'error'
            );
        }
    } catch (error) {
        Swal.fire(
            'Error!',
            'Error al actualizar la vacante: ' + error.message,
            'error'
        );
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const nombreUsuario = localStorage.getItem('usuario');
    if (nombreUsuario) {
      document.getElementById('nombre-usuario').textContent = nombreUsuario;
    }
  });
  

async function deleteVacante(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar!',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            performDeletion(id);
        }
    });
}

async function performDeletion(id) {
    try {
        const success = await ipcRenderer.invoke('delete-vacante', id);
        if (success) {
            Swal.fire(
                'Eliminado!',
                'La vacante ha sido eliminada.',
                'success'
            );
            fetchVacantes();
        } else {
            Swal.fire(
                'Error!',
                'No se pudo eliminar la vacante.',
                'error'
            );
        }
    } catch (error) {
        Swal.fire(
            'Error!',
            'Error al eliminar la vacante: ' + error.message,
            'error'
        );
    }
}
