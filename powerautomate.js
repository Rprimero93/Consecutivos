// ============================================
// CONFIGURACIÓN DE POWER AUTOMATE
// ============================================

// URLs de los flujos de Power Automate
const POWER_AUTOMATE_URLS = {
    registrarConsecutivo: 'https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/b4faae0d555a43a1a7ebfa0b70aee813/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZAwLBgVLOVtW_J-P8A5h2LTvOCEM8raHg6yJ_OoMhvA',
    obtenerResponsables: 'https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/906b181bf34d42f68014cc4cfbbbae26/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=IQ61pWpOSMEfSJT4dlMSQ9h7Yr-xEuf-jwa5BAQkBPw',
    obtenerUltimoConsecutivo: 'https://defaultb24f0388e61b43e0b9e7baa5b0d512.1e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/b72832ea2ba44007997a665be02f8169/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=B2JObejJx7DR6fgkJqhjc9d46l4OE9xZFAi61lRJRSg'
};

// ============================================
// FUNCIONES DE INTEGRACIÓN CON POWER AUTOMATE
// ============================================

/**
 * Mostrar notificación de éxito con el consecutivo
 */
function mostrarNotificacionExito(consecutivo, numeroFila) {
    // Crear elementos de la notificación
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="success-icon"></div>
        <div class="success-content">
            <div class="success-title">¡Consecutivo creado correctamente!</div>
            <div class="success-message">El consecutivo se ha registrado exitosamente en Excel.</div>
            <div class="consecutivo-box">
                <span class="consecutivo-text">${consecutivo}</span>
                <button class="btn-copy" onclick="copiarConsecutivo('${consecutivo}', this)">Copiar</button>
            </div>
        </div>
        <button class="close-notification" onclick="cerrarNotificacion(this)">×</button>
    `;
    
    // Agregar al body
    document.body.appendChild(notification);
    
    // Mostrar con animación
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto-cerrar después de 60 segundos
    setTimeout(() => {
        cerrarNotificacion(notification.querySelector('.close-notification'));
    }, 60000);
}

/**
 * Copiar consecutivo al portapapeles
 */
function copiarConsecutivo(texto, boton) {
    navigator.clipboard.writeText(texto).then(() => {
        const textoOriginal = boton.textContent;
        boton.textContent = '¡Copiado!';
        boton.classList.add('copied');
        
        setTimeout(() => {
            boton.textContent = textoOriginal;
            boton.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        console.error('Error al copiar:', err);
        alert('No se pudo copiar al portapapeles');
    });
}

/**
 * Cerrar notificación
 */
function cerrarNotificacion(boton) {
    const notification = boton.closest('.success-notification');
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
        notification.remove();
    }, 400);
}

/**
 * Cargar lista de responsables desde Excel en SharePoint
 */
async function cargarResponsables() {
    try {
        console.log('Cargando responsables desde Excel...');
        
        const response = await fetch(POWER_AUTOMATE_URLS.obtenerResponsables, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'obtenerResponsables'
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Validar que se recibieron datos
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error('No se recibieron responsables del servidor');
        }
        
        // Poblar el select de responsables
        const selectResponsable = document.getElementById('responsable');
        selectResponsable.innerHTML = '<option value="">Seleccione...</option>';
        
        data.forEach(responsable => {
            const option = document.createElement('option');
            option.value = responsable.NOMBRES;
            option.textContent = responsable.NOMBRES;
            selectResponsable.appendChild(option);
        });

        console.log(`✓ ${data.length} responsables cargados correctamente`);
        return true;
        
    } catch (error) {
        console.error('✗ Error al cargar responsables:', error);
        alert('No se pudieron cargar los responsables desde Excel.\n\nError: ' + error.message + '\n\nPor favor, recargue la página o contacte al administrador.');
        return false;
    }
}

/**
 * Obtener el último número de fila para generar el consecutivo final
 */
async function obtenerUltimoConsecutivo(codigo, subcodigo) {
    try {
        console.log(`Obteniendo último consecutivo para: ${codigo}${subcodigo}`);
        
        const response = await fetch(POWER_AUTOMATE_URLS.obtenerUltimoConsecutivo, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                codigo: codigo,
                subcodigo: subcodigo
            })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const numeroFila = data.ultimaFila || 1;
        
        console.log(`✓ Número de fila calculado: ${numeroFila}`);
        return numeroFila;
        
    } catch (error) {
        console.error('✗ Error al obtener último consecutivo:', error);
        console.warn('⚠ Usando número de fila por defecto: 1');
        return 1;
    }
}

/**
 * Enviar datos del formulario a Power Automate para registrar en Excel
 */
async function enviarAPowerAutomate(formData) {
    const btnRegistrar = document.querySelector('.btn-registrar');
    const textoOriginal = btnRegistrar.textContent;
    btnRegistrar.textContent = 'Registrando...';
    btnRegistrar.disabled = true;

    try {
        // Obtener el número de fila para el consecutivo
        const numeroFila = await obtenerUltimoConsecutivo(formData.codigo, formData.subcodigo);
        const numeroFilaFormateado = String(numeroFila).padStart(3, '0');
        
        // Generar consecutivo final
        const consecutivoFinal = formData.codigo + formData.subcodigo + '_' + numeroFilaFormateado;
        
        console.log(`Registrando consecutivo: ${consecutivoFinal}`);
        
        // Preparar datos para enviar
        const datosParaEnviar = {
            codigo: formData.codigo,
            subcodigo: formData.subcodigo,
            consecutivo: consecutivoFinal,
            numeroFila: numeroFila,
            tipoDocumento: formData.tipoDocumento,
            fecha: formData.fecha,
            asunto: formData.asunto,
            destinatario: formData.destinatario,
            entidad: formData.entidad,
            responsable: formData.responsable,
            radicado: formData.radicado,
            ruta: formData.ruta,
            fechaRegistro: new Date().toISOString()
        };

        // Enviar a Power Automate
        const response = await fetch(POWER_AUTOMATE_URLS.registrarConsecutivo, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosParaEnviar)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error del servidor:', errorText);
            throw new Error(`Error al registrar (${response.status})`);
        }

        const resultado = await response.json();
        
        // Actualizar campo de consecutivo con el valor final
        document.getElementById('consecutivo').value = consecutivoFinal;

        console.log('✓ Registro exitoso:', resultado);
        
        // Mostrar notificación de éxito
        mostrarNotificacionExito(consecutivoFinal, numeroFila);
        
        // Limpiar formulario
        document.getElementById('formConsecutivos').reset();
        document.getElementById('fecha').valueAsDate = new Date();
        document.getElementById('codigo').value = '';
        document.getElementById('subcodigo').value = '';
        document.getElementById('consecutivo').value = '';
        document.getElementById('groupNombreSubcodigo').classList.add('hidden');

    } catch (error) {
        console.error('✗ Error al enviar datos:', error);
        alert('Error al registrar el consecutivo.\n\nError: ' + error.message + '\n\nPor favor, intente nuevamente o contacte al administrador.');
    } finally {
        // Restaurar botón
        btnRegistrar.textContent = textoOriginal;
        btnRegistrar.disabled = false;
    }
}

// ============================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('===========================================');
    console.log('Formulario de Consecutivos - Inicializando');
    console.log('===========================================');
    
    // Cargar responsables desde Excel
    const cargaExitosa = await cargarResponsables();
    
    if (cargaExitosa) {
        console.log('✓ Sistema listo para usar');
    } else {
        console.warn('⚠ Sistema iniciado con errores - Verifique la conexión');
    }
});