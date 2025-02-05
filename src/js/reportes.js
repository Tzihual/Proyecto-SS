const { ipcRenderer } = require('electron');

document.getElementById('report-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startDate = document.getElementById('fechaInicio').value;
    const endDate = document.getElementById('fechaFin').value;
    const today = new Date().toISOString().split('T')[0];
    //.toISOString().split('T')[0]; // Obtener la fecha de hoy en formato YYYY-MM-DD

    if (new Date(startDate) > new Date(endDate)) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de inicio no puede ser mayor que la fecha de fin',
        });
        return;
    }
   
    

    try {
        const reportData = await fetchReportData(startDate, endDate);
        displayReport(reportData);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Error al generar el reporte',
        });
    }
    
});
async function fetchReportData(startDate, endDate) {
    return await ipcRenderer.invoke('get-report-data', { startDate, endDate });
}


const rowsPerPage = 10; // Cantidad de filas por página
let currentPage = 1;
let totalPages = 1;
let allReportData = []; // Guardará todas las vacantes

function displayReport(reportData) {
    allReportData = reportData; // Guardar todos los datos en una variable global
    totalPages = Math.ceil(allReportData.length / rowsPerPage);
    currentPage = 1; // Reiniciar página a la primera
    renderTable();
    renderPaginationControls();
}

function renderTable() {
    const reportResult = document.getElementById('report-result');
    reportResult.innerHTML = ''; // Limpiar resultados anteriores

    if (allReportData.length === 0) {
        reportResult.innerHTML = '<p>No se encontraron plazas vacantes en el rango de fechas seleccionado.</p>';
        return;
    }

    const table = document.createElement('table');
    table.id = 'report-table';
    table.innerHTML = `
        <thead>
            <tr>
                <th>Clave Presupuestal</th>
                <th>Clave del C.T</th>
                <th>Municipio</th>
                <th>Nombre de la escuela</th>
                <th>Nivel Educativo</th>
                <th class="materia-column">Materia</th>
                <th class="detalle-column">Detalle de Materia</th>
                <th class="horas-column">Horas</th>
                <th>Tipo de contrato</th>
                <th>Necesidad del servicio</th>
                <th>Observaciones</th>
            </tr>
        </thead>
        <tbody>
            ${allReportData
                .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage) // Obtener solo las filas de la página actual
                .map(vacante => `
                    <tr>
                        <td>${vacante.clavePresupuestal}</td>
                        <td>${vacante.claveCT}</td>
                        <td>${vacante.municipio}</td>
                        <td>${vacante.nombreEscuela}</td>
                        <td>${vacante.nivelEducativo}</td>
                        <td class="materia-column">${(vacante.nivelEducativo === 'Secundaria tecnicas' || vacante.nivelEducativo === 'Secundaria generales') ? vacante.materiaSecundaria || 'N/A' : 'N/A'}</td>
                        <td class="detalle-column">${(vacante.nivelEducativo === 'Secundaria tecnicas' || vacante.nivelEducativo === 'Secundaria generales') && (vacante.materiaSecundaria === 'Artes' || vacante.materiaSecundaria === 'Tecnologias') ? vacante.detalleMateria || 'N/A' : 'N/A'}</td>
                        <td class="horas-column">${vacante.nivelEducativo === 'Secundaria técnicas' || vacante.nivelEducativo === 'Secundaria generales' ? vacante.horasSecundaria || 'N/A' : 'N/A'}</td>
                        <td>${vacante.tipoContrato}</td>
                        <td>${vacante.estatus}</td>
                        <td>${vacante.observaciones}</td>
                    </tr>
                `).join('')}
        </tbody>
    `;

    reportResult.appendChild(table);

    // Mostrar el botón de descargar PDF y el filtro de nivel educativo
    document.getElementById('filter-container').style.display = 'block';
    document.getElementById('download').style.display = 'block';
    document.getElementById('filter-nivel').style.display = 'block';
    document.getElementById('filter-necesidad-container').style.display = 'block'; 
    // Mostrar el select y el botón de descarga una vez generado el reporte
document.getElementById('download-format-container').style.display = 'block';
}

document.getElementById('filter-nivel').addEventListener('change', function() {
    const selectedNivel = this.value;

    if (selectedNivel === 'Secundaria tecnicas' || selectedNivel === 'Secundaria generales') {
        document.querySelectorAll('.materia-column, .horas-column, .detalle-column').forEach(column => {
            column.style.display = 'table-cell';
        });
    } else {
        document.querySelectorAll('.materia-column, .horas-column, .detalle-column').forEach(column => {
            column.style.display = 'table-cell'; // Siempre se muestran, pero con "N/A"
        });
    }

    filterReport(selectedNivel);
});

document.getElementById('filter-necesidad').addEventListener('change', function() {
    const selectedNecesidad = this.value;
    
    const rows = document.querySelectorAll('#report-table tbody tr');
    rows.forEach(row => {
      const estatus = row.cells[8].textContent; // Asumiendo que la columna de estatus es la séptima
      if (selectedNecesidad === 'Todos' || estatus === selectedNecesidad) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });
  });
  
  document.addEventListener('DOMContentLoaded', function () {
    const nombreUsuario = localStorage.getItem('usuario');
    if (nombreUsuario) {
      document.getElementById('nombre-usuario').textContent = nombreUsuario;
    }
  });
  
  function renderPaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Limpiar controles previos

    if (totalPages <= 1) return; // Si solo hay una página, no mostrar controles

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Anterior';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTable();
            renderPaginationControls();
        }
    });

    const pageInfo = document.createElement('span');
    pageInfo.textContent = ` Página ${currentPage} de ${totalPages} `;

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Siguiente';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderTable();
            renderPaginationControls();
        }
    });

    paginationControls.appendChild(prevButton);
    paginationControls.appendChild(pageInfo);
    paginationControls.appendChild(nextButton);
}


// Función para aplicar filtros combinados
function applyFilters() {
    const selectedNivel = document.getElementById('filter-nivel').value;
    const selectedNecesidad = document.getElementById('filter-necesidad').value;
    
    const rows = document.querySelectorAll('#report-table tbody tr');

    rows.forEach(row => {
        const nivelEducativo = row.querySelector('td:nth-child(5)')?.textContent.trim(); // Obtener texto del nivel educativo
        const necesidadServicio = row.querySelector('td:nth-child(10)')?.textContent.trim(); // Obtener texto de necesidad

        const matchesNivel = selectedNivel === 'Todos' || (nivelEducativo && nivelEducativo === selectedNivel);
        const matchesNecesidad = selectedNecesidad === 'Todos' || (necesidadServicio && necesidadServicio === selectedNecesidad);

        // Solo muestra la fila si ambas condiciones se cumplen
        row.style.display = (matchesNivel && matchesNecesidad) ? '' : 'none';
    });


    totalPages = Math.ceil(filteredData.length / rowsPerPage);
    currentPage = 1; // Reiniciar a la primera página
    allReportData = filteredData;
    renderTable();
    renderPaginationControls();
}

// Agregar eventos para que se actualice en tiempo real
document.getElementById('filter-nivel').addEventListener('change', applyFilters);
document.getElementById('filter-necesidad').addEventListener('change', applyFilters);


// Actualizar eventos para que llamen a la misma función
document.getElementById('filter-nivel').addEventListener('change', applyFilters);
document.getElementById('filter-necesidad').addEventListener('change', applyFilters);


document.getElementById('download').addEventListener('click', function() {
    const format = document.getElementById('download-format').value;
    if (format === 'pdf') {
        downloadPDF();
    } else if (format === 'excel') {
        downloadExcel();
    }
});



   function downloadPDF(){ const { jsPDF } = window.jspdf;
    html2canvas(document.getElementById('report-table')).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        // Añadir título y fecha
        pdf.setFontSize(18);
        pdf.text("Reporte de Vacantes", 14, 22);
        
        // Agregar margen entre el título y la tabla
        pdf.setFontSize(12);
        pdf.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Agregar la imagen (tabla convertida en imagen)
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth() - 28; // Considerar márgenes
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 14, 35, pdfWidth, pdfHeight);
        
        // Descargar el PDF
        pdf.save('reporte_vacantes.pdf');
    });
}

const ExcelJS = require('exceljs');

function downloadExcel() {
    const table = document.getElementById('report-table');
    if (table) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        // Crear la fila de encabezado
        const headers = Array.from(table.querySelectorAll('th')).map(th => th.innerText);
        worksheet.addRow(headers);

        // Crear las filas de datos solo para las filas visibles
        const rows = Array.from(table.querySelectorAll('tr')).slice(1).filter(row => row.style.display !== 'none').map(tr => {
            return Array.from(tr.querySelectorAll('td')).map(td => td.innerText);
        });
        rows.forEach(row => worksheet.addRow(row));

        // Descargar el archivo
        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'reporte_vacantes.xlsx';
            a.click();
            URL.revokeObjectURL(url);
        });
    } else {
        console.error('Error: la tabla no está definida.');
    }
}







