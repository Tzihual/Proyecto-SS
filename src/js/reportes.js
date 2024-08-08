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
                <th>Tipo de contrato</th>
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
                    <td>${vacante.tipoContrato}</td>
                </tr>
            `).join('')}
        </tbody>
    `;
    reportResult.appendChild(table);

    // Mostrar el botón de descargar PDF
    document.getElementById('download-pdf').style.display = 'block';
}

document.getElementById('download-pdf').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
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
});
