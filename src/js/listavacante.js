const { ipcRenderer } = require('electron');

//let allVacantes = [];

let currentPage = 1;
const limit = 10;

async function fetchVacantes(page = 1) {
    try {
        const filter = {
            nivelEducativo: document.getElementById('filter-nivel')?.value || "Todos",
            municipio: document.getElementById('filter-municipio')?.value || "Todos",
            tipoContrato: document.getElementById('filter-tipo-contrato')?.value || "Todos",
            searchText: document.getElementById('search-input')?.value || ""
        };

        const response = await ipcRenderer.invoke('get-paginated-vacantes', { page, limit, filter });
        allVacantes = response.vacantes;
        renderVacantes(allVacantes);
        updatePagination(response.total, page);
        currentPage = page;
    } catch (error) {
        console.error('Error al obtener vacantes:', error);
    }
}


function updatePagination(total, currentPage) {
    const totalPages = Math.ceil(total / limit);
    const paginationContainer = document.getElementById('pagination');

    paginationContainer.innerHTML = ''; // Limpiar contenido previo

    console.log("Total Pages:", totalPages, "Current Page:", currentPage);

    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Anterior';
        prevButton.classList.add('pagination-btn');
        prevButton.onclick = () => fetchVacantes(currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Página ${currentPage} de ${totalPages} `;
    pageInfo.classList.add('pagination-info');
    paginationContainer.appendChild(pageInfo);

    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Siguiente';
        nextButton.classList.add('pagination-btn');
        nextButton.onclick = () => fetchVacantes(currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}



// Delegación de eventos para manejar dinámicamente los clics en botones dentro de la tabla
document.addEventListener('DOMContentLoaded', function() {
    const editMotivoSelect = document.getElementById('edit-motivo');
    const editOtroMotivoContainer = document.createElement('div'); // Contenedor para "Otro motivo"
    
    editOtroMotivoContainer.innerHTML = `
        <label for="edit-otro-motivo">Especifique el motivo</label>
        <input type="text" id="edit-otro-motivo">
    `;
    editOtroMotivoContainer.style.display = 'none'; // Se oculta al inicio
    editMotivoSelect.parentNode.appendChild(editOtroMotivoContainer); // Agregar debajo del select

    editMotivoSelect.addEventListener('change', function () {
        if (editMotivoSelect.value === 'otro') {
            editOtroMotivoContainer.style.display = 'block';
            document.getElementById('edit-otro-motivo').setAttribute('required', 'required');
        } else {
            editOtroMotivoContainer.style.display = 'none';
            document.getElementById('edit-otro-motivo').removeAttribute('required');
        }
    });

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

    document.getElementById('filter-nivel').addEventListener('change', () => fetchVacantes(1));
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

    if (selectedNivel === 'Secundaria tecnicas' || selectedNivel === 'Secundaria generales') {
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

document.getElementById('edit-materias-secundaria').addEventListener('change', function () {
    const selectedMateria = this.value;
    const detalleMateriaContainer = document.getElementById('edit-detalle-materia-container');

    if (selectedMateria === 'Artes' || selectedMateria === 'Tecnologias') {
        detalleMateriaContainer.style.display = 'block';
        document.getElementById('edit-detalle-materia').setAttribute('required', 'required');
    } else {
        detalleMateriaContainer.style.display = 'none';
        document.getElementById('edit-detalle-materia').removeAttribute('required');
        document.getElementById('edit-detalle-materia').value = '';
    }
});

function filterReport(nivel) {
    const filteredVacantes = allVacantes.filter(vacante =>
        nivel === 'Todos' || vacante.nivelEducativo === nivel
    );
    renderVacantes(filteredVacantes);

    if (nivel === 'Secundaria tecnicas' || nivel === 'Secundaria generales') {
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
        let materiaColumn = vacante.nivelEducativo === 'Secundaria tecnicas' || vacante.nivelEducativo === 'Secundaria generales' ? `<td>${vacante.materiaSecundaria || 'N/A'}</td>` : '<td>N/A</td>';

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
// Agregar un evento de cambio para mostrar/ocultar campos en el modal de edición
document.getElementById('edit-nivel-educativo').addEventListener('change', function () {
    const selectedNivel = this.value;
    const secundariaFields = document.getElementById('secundaria-fields');

    if (selectedNivel === 'Secundaria tecnica' || selectedNivel === 'Secundaria generales') {
        secundariaFields.style.display = 'block';
        document.getElementById('edit-materias-secundaria').setAttribute('required', 'required');
        document.getElementById('edit-horas-secundaria').setAttribute('required', 'required');
    } else {
        secundariaFields.style.display = 'none';
        // Poner en null los valores de materias y horas
        document.getElementById('edit-materias-secundaria').value = null;
        document.getElementById('edit-horas-secundaria').value = null;
        document.getElementById('edit-materias-secundaria').removeAttribute('required');
        document.getElementById('edit-horas-secundaria').removeAttribute('required');
    }
});

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
        const editMotivoSelect = document.getElementById('edit-motivo');
        const editOtroMotivoInput = document.getElementById('edit-otro-motivo');
        const editOtroMotivoContainer = document.getElementById('edit-otro-motivo-container');

        const motivosPredefinidos = [
            "11-41 (Licencia por asuntos particulares)", "11-42 (Licencia por pasar a otro empleo)", "11-43 (Licencia por comisión sindical ó elección popular)", "11-44 (Licencia por Gravidez)", "11-48 (Licencia Prepensionaria)", "11-51 (Prórroga de Licencia por asuntos particulares)", "11-52 (Prórroga de Licencia por pasar a otro empleo)",
            "11-53 (Prórroga de Licencia por comisión sindical ó elección popular)","Licencia por acuerdo presidencial No. 754","12-61 (Reanudación de Labores de una Prorroga ó Licencia por asuntos particulares)","12-62 (Reanudación de Labores de una Prórroga o Licencia por pasar a otro empleo)","12-63 (Reanudación de Labores de una Prórroga o Licencia por comisión sindical o elección popular)", "06-31 (baja por Defunción)", "06-32 (baja por renuncia)", "06-33 (baja por jubilación)", "06-34 (baja por Abandono de Empleo)", "06-75 (baja por incapacidad del ISSSTE)", "07-35 (baja por término de nombramiento)", "07-37 (baja por pasar a otro empleo)", "otro"
        ];
        
        if (!vacante.motivo) {
            editMotivoSelect.value = ''; // Dejarlo en "Seleccione un motivo"
            editOtroMotivoContainer.style.display = 'none';
            editOtroMotivoInput.value = ''; 
        } else if (motivosPredefinidos.includes(vacante.motivo)) {
            editMotivoSelect.value = vacante.motivo; // Seleccionar motivo si está en la lista
            editOtroMotivoContainer.style.display = vacante.motivo === 'otro' ? 'block' : 'none';
            editOtroMotivoInput.value = vacante.motivo === 'otro' ? vacante.motivo : ''; 
        } else {
            editMotivoSelect.value = 'otro'; // Si no está en la lista, marcar "Otro"
            editOtroMotivoContainer.style.display = 'block';
            editOtroMotivoInput.value = vacante.motivo; // Cargar motivo personalizado
        }
        document.getElementById('editModal').style.display = 'block';

        const secundariaFields = document.getElementById('secundaria-fields');
        if (vacante.nivelEducativo === 'Secundaria tecnica' || vacante.nivelEducativo === 'Secundaria generales') {
            secundariaFields.style.display = 'block';
            document.getElementById('edit-materias-secundaria').value = vacante.materiaSecundaria || '';
            document.getElementById('edit-horas-secundaria').value = vacante.horasSecundaria || '';
            document.getElementById('edit-materias-secundaria').setAttribute('required', 'required');
            document.getElementById('edit-horas-secundaria').setAttribute('required', 'required');
            
            // Manejo de "Especifique el tipo"
            if (vacante.materiaSecundaria === 'Artes' || vacante.materiaSecundaria === 'Tecnologias') {
                document.getElementById('edit-detalle-materia-container').style.display = 'block';
                document.getElementById('edit-detalle-materia').value = vacante.detalleMateria || '';
            } else {
                document.getElementById('edit-detalle-materia-container').style.display = 'none';
                document.getElementById('edit-detalle-materia').value = '';
            }

        } else {
            secundariaFields.style.display = 'none';
            document.getElementById('edit-materias-secundaria').value = null;
            document.getElementById('edit-horas-secundaria').value = null;
            document.getElementById('edit-materias-secundaria').removeAttribute('required');
            document.getElementById('edit-horas-secundaria').removeAttribute('required');
            document.getElementById('edit-detalle-materia-container').style.display = 'none'; // Ocultar el detalle de materia si no es secundaria
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

    const editMotivoSelect = document.getElementById('edit-motivo');
    const editOtroMotivoInput = document.getElementById('edit-otro-motivo');

    const updatedVacante = {
        clavePresupuestal: document.getElementById('edit-clave-presupuestal').value,
        municipio: document.getElementById('edit-municipio').value,
        claveCT: document.getElementById('edit-clave-ct').value,
        localidad: document.getElementById('edit-localidad').value,
        funcion: document.getElementById('edit-funcion').value,
        fechaInicio: document.getElementById('edit-fecha-inicio').value,
        motivo: editMotivoSelect.value === 'otro' ? editOtroMotivoInput.value : editMotivoSelect.value,fechaFin: document.getElementById('edit-fecha-fin').value,
        nombreEscuela: document.getElementById('edit-nombre-escuela').value,
        perfilRequerido: document.getElementById('edit-perfil-requerido').value,
        turno: document.getElementById('edit-turno').value,
        estatus: document.getElementById('edit-estatus').value,
        nivelEducativo: document.getElementById('edit-nivel-educativo').value,
        zonaEconomica: document.getElementById('edit-zona-economica').value,
        tipoContrato: document.getElementById('edit-tipo-contrato').value,
        observaciones: document.getElementById('edit-observaciones').value
    };

    if (document.getElementById('edit-nivel-educativo').value === 'Secundaria tecnicas' || document.getElementById('edit-nivel-educativo').value === 'Secundaria generales') {
        updatedVacante.materiaSecundaria = document.getElementById('edit-materias-secundaria').value;
        updatedVacante.horasSecundaria = document.getElementById('edit-horas-secundaria').value;

        if (updatedVacante.materiaSecundaria === 'Artes' || updatedVacante.materiaSecundaria === 'Tecnologias') {
            updatedVacante.detalleMateria = document.getElementById('edit-detalle-materia').value;
        } else {
            updatedVacante.detalleMateria = null;
        }
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
