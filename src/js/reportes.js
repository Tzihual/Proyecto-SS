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
    

   /* if (endDate > today) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'La fecha de fin no puede ser posterior al día de hoy',
        });
        return;
    }*/
    

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
                <th class="detalle-column">Detalle de Materia</th>
                <th class="horas-column">Horas</th>
                <th>Tipo de contrato</th>
                <th>Necesidad del servicio</th>
                <th>Observaciones</th>
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
                     <td class="materia-column">${vacante.nivelEducativo === 'Secundaria' ? vacante.materiaSecundaria || 'N/A' : 'N/A'}</td>
                     <td class="detalle-column">${
                        vacante.nivelEducativo === 'Secundaria' && (vacante.materiaSecundaria === 'Artes' || vacante.materiaSecundaria === 'Tecnologias') 
                        ? vacante.detalleMateria || 'N/A' 
                        : 'N/A'
                    }</td> 
                    <td class="horas-column">${vacante.nivelEducativo === 'Secundaria' ? vacante.horasSecundaria || 'N/A' : 'N/A'}</td>
                     <td>${vacante.tipoContrato}</td>
                    <td>${vacante.estatus}</td>
                    <td>${vacante.observaciones}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    reportResult.appendChild(table);
/*
    // Inicialmente ocultar las columnas de materia y horas si no son relevantes
    document.querySelectorAll('.materia-column, .horas-column').forEach(column => {
        column.style.display = 'none';
    });
*/
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

    if (selectedNivel === 'Secundaria') {
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







