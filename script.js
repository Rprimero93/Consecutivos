// ============================================
// CONFIGURACIÓN DE DATOS
// ============================================

// Mapeo de códigos según tipo de documento
const CODIGOS_TIPO = {
    "ACTAS": "12_602_10",
    "BANCO DE PROYECTOS": "12_602_75",
    "HISTORIALES DE BIENES INMUEBLES": "12_602_205",
    "HISTORIALES DE VEHICULOS": "12_602_210",
    "INFORMES": "12_602_225",
    "INSTRUMENTOS ARCHIVISTICOS": "12_602_265",
    "INSTRUMENTOS DE CONTROL Y REGISTRO": "12_602_290",
    "PLANES": "12_602_350"
};

// Mapeo de subcódigos según nombre
const SUBCODIGOS = {
    "Actas de Comité de gestión Ambiental": "_56",
    "Actas de Comité de Seguridad Vial": "_65",
    "Actas de reunión de la Dependencia": "_116",
    "Banco de Proyectos Arquitectónicos": "_140",
    "Informes a Entes de Control": "_278",
    "Informes de gestión": "_293",
    "Inventarios Documentales de Archivo de gestión": "_424",
    "Instrumentos de Control y Registro de Servicios Administrativos": "_403",
    "Planes de Adecuaciones y Mantenimientos Preventivos y Correctivos Bienes Muebles e Inmuebles": "_466",
    "Planes de Infraestructura y Mantenimiento": "_504",
    "Planes Estratégicos de Seguridad Vial": "_562",
    "Planes Institucionales de Gestion Ambiental (PIGA)": "_586"
};

// Opciones de nombre subcódigo según tipo de documento
const OPCIONES_SUBCODIGO = {
    "ACTAS": [
        "Actas de Comité de gestión Ambiental",
        "Actas de Comité de Seguridad Vial",
        "Actas de reunión de la Dependencia"
    ],
    "BANCO DE PROYECTOS": [
        "Banco de Proyectos Arquitectónicos"
    ],
    "HISTORIALES DE BIENES INMUEBLES": [],
    "HISTORIALES DE VEHICULOS": [],
    "INFORMES": [
        "Informes a Entes de Control",
        "Informes de gestión"
    ],
    "INSTRUMENTOS ARCHIVISTICOS": [
        "Inventarios Documentales de Archivo de gestión"
    ],
    "INSTRUMENTOS DE CONTROL Y REGISTRO": [
        "Instrumentos de Control y Registro de Servicios Administrativos"
    ],
    "PLANES": [
        "Planes de Adecuaciones y Mantenimientos Preventivos y Correctivos Bienes Muebles e Inmuebles",
        "Planes de Infraestructura y Mantenimiento",
        "Planes Estratégicos de Seguridad Vial",
        "Planes Institucionales de Gestion Ambiental (PIGA)"
    ]
};

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const tipoDocumento = document.getElementById('tipoDocumento');
const nombreSubcodigo = document.getElementById('nombreSubcodigo');
const groupNombreSubcodigo = document.getElementById('groupNombreSubcodigo');
const codigo = document.getElementById('codigo');
const subcodigo = document.getElementById('subcodigo');
const consecutivo = document.getElementById('consecutivo');
const form = document.getElementById('formConsecutivos');
const closeBtn = document.querySelector('.close-btn');

// ============================================
// FUNCIONES PRINCIPALES
// ============================================

/**
 * Actualizar opciones de Nombre Subcódigo según Tipo de Documento
 */
function actualizarOpcionesSubcodigo(tipo) {
    nombreSubcodigo.innerHTML = '<option value="">Seleccione...</option>';
    
    const opciones = OPCIONES_SUBCODIGO[tipo] || [];
    
    if (opciones.length === 0) {
        groupNombreSubcodigo.classList.add('hidden');
        nombreSubcodigo.removeAttribute('required');
        subcodigo.value = '';
    } else {
        groupNombreSubcodigo.classList.remove('hidden');
        nombreSubcodigo.setAttribute('required', 'required');
        
        opciones.forEach(opcion => {
            const option = document.createElement('option');
            option.value = opcion;
            option.textContent = opcion;
            nombreSubcodigo.appendChild(option);
        });
    }
}

/**
 * Actualizar código según tipo de documento
 */
function actualizarCodigo(tipo) {
    const codigoValor = CODIGOS_TIPO[tipo] || '';
    codigo.value = codigoValor;
    generarConsecutivo();
}

/**
 * Actualizar subcódigo según nombre subcódigo
 */
function actualizarSubcodigo(nombre) {
    const subcodigoValor = SUBCODIGOS[nombre] || '';
    subcodigo.value = subcodigoValor;
    generarConsecutivo();
}

/**
 * Generar consecutivo completo (formato preliminar)
 */
function generarConsecutivo() {
    const codigoVal = codigo.value;
    const subcodigoVal = subcodigo.value;
    
    if (codigoVal) {
        consecutivo.value = codigoVal + subcodigoVal + '_[Pendiente]';
    } else {
        consecutivo.value = '';
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Cambio en Tipo de Documento
tipoDocumento.addEventListener('change', function() {
    const tipo = this.value;
    
    if (tipo) {
        actualizarOpcionesSubcodigo(tipo);
        actualizarCodigo(tipo);
    } else {
        groupNombreSubcodigo.classList.add('hidden');
        nombreSubcodigo.removeAttribute('required');
        codigo.value = '';
        subcodigo.value = '';
        consecutivo.value = '';
    }
});

// Cambio en Nombre Subcódigo
nombreSubcodigo.addEventListener('change', function() {
    const nombre = this.value;
    
    if (nombre) {
        actualizarSubcodigo(nombre);
    } else {
        subcodigo.value = '';
        generarConsecutivo();
    }
});

// Botón de cerrar
closeBtn.addEventListener('click', function() {
    if (confirm('¿Está seguro que desea cerrar el formulario?')) {
        window.close();
    }
});

// Submit del formulario
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar que se haya generado el consecutivo
    if (!codigo.value) {
        alert('Debe seleccionar un tipo de documento');
        return;
    }
    
    // Validar que si aplica subcódigo, esté seleccionado
    if (!groupNombreSubcodigo.classList.contains('hidden') && !nombreSubcodigo.value) {
        alert('Debe seleccionar un nombre de subcódigo');
        return;
    }
    
    // Recopilar datos del formulario
    const formData = {
        fecha: document.getElementById('fecha').value,
        tipoDocumento: tipoDocumento.value,
        codigo: codigo.value,
        subcodigo: subcodigo.value || '',
        responsable: document.getElementById('responsable').value,
        asunto: document.getElementById('asunto').value,
        destinatario: document.getElementById('destinatario').value,
        entidad: document.getElementById('entidad').value || '',
        radicado: document.getElementById('radicado').value || '',
        ruta: document.getElementById('ruta').value || ''
    };
    
    // Enviar a Power Automate
    enviarAPowerAutomate(formData);
});

// ============================================
// INICIALIZACIÓN
// ============================================

// Establecer fecha actual por defecto
document.getElementById('fecha').valueAsDate = new Date();

// Ocultar grupo de nombre subcódigo inicialmente
groupNombreSubcodigo.classList.add('hidden');

console.log('✓ Formulario de Consecutivos inicializado correctamente');