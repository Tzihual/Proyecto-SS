const { ipcRenderer } = require('electron');




document.getElementById('report-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (new Date(startDate) > new Date(endDate)) {
        alert('Error', 'La fecha de inicio no puede ser mayor que la fecha de fin', 'error');
        return;
    }

    try {
        const reportData = await fetchReportData(startDate, endDate);
        displayReport(reportData);
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        alert('Error', 'Error al generar el reporte', 'error');
    }
});

async function fetchReportData(startDate, endDate) {
    return await ipcRenderer.invoke('get-report-data', { startDate, endDate });
}

function displayReport(reportData) {
    const reportResult = document.getElementById('report-result');
    reportResult.innerHTML = ''; // Limpia resultados anteriores

    if (reportData.length === 0) {
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
                <th class="horas-column">Horas</th>
                <th>Tipo de contrato</th>
                <th>Necesidad del servicio</th>
            </tr>
        </thead>
        <tbody>
            ${reportData.map(vacante => `
                <tr>
                    <td>${vacante.clavePresupuestal}</td>
                    <td>${vacante.claveCT}</td>
                    <td>${vacante.municipio}</td>
                    <td>${vacante.nombreEscuela}</td>
                    <td>${vacante.nivelEducativo}</td>
                    <td class="materia-column">${vacante.materiaSecundaria || ''}</td>
                    <td class="horas-column">${vacante.horasSecundaria || ''}</td>
                    <td>${vacante.tipoContrato}</td>
                    <td>${vacante.estatus}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    reportResult.appendChild(table);

    // Inicialmente ocultar las columnas de materia y horas si no son relevantes
    document.querySelectorAll('.materia-column, .horas-column').forEach(column => {
        column.style.display = 'none';
    });

    // Mostrar el botón de descargar PDF y el filtro de nivel educativo
    document.getElementById('filter-container').style.display = 'block';
    document.getElementById('download').style.display = 'block';
    document.getElementById('filter-nivel').style.display = 'block';
    document.getElementById('filter-necesidad-container').style.display = 'block'; 
    // Mostrar el select y el botón de descarga una vez generado el reporte
document.getElementById('download-format-container').style.display = 'block';
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
  

// Filtrar el reporte por nivel educativo
function filterReport(nivel) {
    const rows = document.querySelectorAll('#report-table tbody tr');
    rows.forEach(row => {
        const nivelEducativo = row.querySelector('td:nth-child(5)').textContent;
        if (nivel === 'Todos' || nivelEducativo === nivel) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

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


function downloadExcel() {
    // Obtener la tabla de HTML por su ID
    const table = document.getElementById('report-table');
    console.log(table);

    // Verificar que la tabla existe y que XLSX está disponible
    console.log(XLSX.utils);
    if (table && typeof XLSX !== 'undefined') {
        // Crear un nuevo libro de trabajo
        const workbook = XLSX.utils.book_new();

        // Convertir la tabla HTML a una hoja de cálculo
        const worksheet = XLSX.utils.table_to_sheet(table);

        // Agregar la hoja de cálculo al libro de trabajo
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

        // Escribir el archivo Excel
        XLSX.writeFile(workbook, 'reporte_vacantes.xlsx');
    } else {
        // Mostrar un mensaje de error en caso de que la tabla o XLSX no estén definidos
        console.error('Error: XLSX o la tabla no está definida.');
    }
}






