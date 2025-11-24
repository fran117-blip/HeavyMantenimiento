const CLAVE_SESION = "usuario_sesion_activa";
let listaReportes = []; 
let usuarioActual = null; 
let idRegistroSeleccionado = null;

// --- CUANDO LA PÁGINA CARGA ---
window.onload = function() {
    // Revisamos si hay un usuario guardado en la memoria del navegador
    let sesionGuardada = localStorage.getItem(CLAVE_SESION) || sessionStorage.getItem(CLAVE_SESION);
    
    if (sesionGuardada) {
        // Si existe, lo convertimos de texto a objeto y configuramos la pantalla
        usuarioActual = JSON.parse(sesionGuardada);
        configurarInterfazUsuario();
    }
};

// ==========================================
// 1. SISTEMA DE LOGIN Y SESIÓN
// ==========================================

async function iniciarSesion(event) {
    event.preventDefault(); // Evita que la página se recargue sola
    
    const correo = document.getElementById('input-correo').value;
    const pass = document.getElementById('input-password').value;
    const mantener = document.getElementById('check-mantener').checked;
    const errorMsg = document.getElementById('login-error');
    const btn = event.target.querySelector('button');

    // Cambiamos el botón para que el usuario sepa que está pensando
    btn.innerText = "Verificando..."; 
    btn.disabled = true; 
    errorMsg.style.display = 'none';

    try {
        // Enviamos los datos al archivo PHP
        const respuesta = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ correo: correo, password: pass })
        });
        
        const datos = await respuesta.json();

        if (datos.success) {
            // Si el login es correcto:
            usuarioActual = datos.usuario;
            const userStr = JSON.stringify(usuarioActual);
            
            // Guardamos la sesión (Local = para siempre, Session = solo un rato)
            if (mantener) {
                localStorage.setItem(CLAVE_SESION, userStr);
            } else {
                sessionStorage.setItem(CLAVE_SESION, userStr);
            }
            
            configurarInterfazUsuario();
        } else {
            // Si la contraseña está mal
            errorMsg.style.display = 'block';
            errorMsg.innerText = "❌ Credenciales incorrectas";
        }
    } catch (e) {
        errorMsg.style.display = 'block';
        errorMsg.innerText = "❌ Error de conexión";
    } finally {
        // Restauramos el botón
        btn.innerText = "Entrar"; 
        btn.disabled = false;
    }
}

function cerrarSesion() {
    // Borramos todo de la memoria
    localStorage.removeItem(CLAVE_SESION);
    sessionStorage.removeItem(CLAVE_SESION);
    // Recargamos la página para limpiar todo
    location.reload();
}

function configurarInterfazUsuario() {
    // --- ARREGLO VISUAL: Cambiamos el fondo manualmente ---
    document.body.style.backgroundImage = "none";      
    document.body.style.backgroundColor = "#f0f2f5";   
    document.body.style.display = "block";             
    document.body.style.paddingTop = "20px";           

    // Ocultamos el login y mostramos el menú
    document.getElementById('vista-login').classList.remove('pantalla-activa');
    document.getElementById('encabezado-nav').style.display = 'flex';
    document.getElementById('usuario-nav').innerText = usuarioActual.nombre;
    
    // Mostramos la pantalla según si es Admin o Operador
    if (usuarioActual.rol === 'admin') {
        document.getElementById('rol-usuario').innerText = "(Administrador)";
        cargarVistaAdmin();
    } else {
        document.getElementById('rol-usuario').innerText = "(Operador)";
        cargarVistaOperador();
    }
}

// Función auxiliar para cambiar de "pantallas" (oculta todas, muestra una)
function cambiarPantalla(id) {
    const pantallas = document.querySelectorAll('.pantalla');
    pantallas.forEach(function(p) {
        p.classList.remove('pantalla-activa');
    });
    document.getElementById(id).classList.add('pantalla-activa');
}

// ==========================================
// 2. FUNCIONES DE AYUDA (VISUALES)
// ==========================================

// Función para el OJO de la contraseña (Ver / Ocultar)
function mostrarOcultarPassword() {
    const inputPass = document.getElementById('input-password');
    const icono = document.getElementById('toggle-password');

    if (inputPass.type === "password") {
        inputPass.type = "text"; // Muestra el texto
        icono.classList.remove('fa-eye');
        icono.classList.add('fa-eye-slash');
    } else {
        inputPass.type = "password"; // Oculta con puntitos
        icono.classList.remove('fa-eye-slash');
        icono.classList.add('fa-eye');
    }
}

// Función para descargar los datos de la Base de Datos
async function actualizarDatosDesdeServer() {
    try {
        const respuesta = await fetch('obtener_reportes.php');
        const datos = await respuesta.json();
        listaReportes = datos; // Guardamos los datos en la variable global
        return true;
    } catch (error) {
        console.error("Error al obtener datos:", error);
        return false;
    }
}

// ==========================================
// 3. LÓGICA DEL OPERADOR
// ==========================================

async function cargarVistaOperador() {
    cambiarPantalla('vista-operador');
    document.getElementById('nombre-operador-titulo').innerText = usuarioActual.nombre;
    
    const tbody = document.getElementById('cuerpo-tabla-operador');
    tbody.innerHTML = '<tr><td colspan="3">Cargando...</td></tr>';

    await actualizarDatosDesdeServer();

    // Filtramos: Solo mostramos los reportes de ESTE operador
    const misRegistros = listaReportes.filter(function(r) {
        return r.correo_operador === usuarioActual.correo;
    });
    
    tbody.innerHTML = '';
    
    if(misRegistros.length === 0) {
        document.getElementById('mensaje-vacio-operador').style.display = 'block';
    } else {
        document.getElementById('mensaje-vacio-operador').style.display = 'none';
        misRegistros.forEach(function(r) {
            tbody.innerHTML += `<tr><td>${r.fecha}</td><td>${r.maquina}</td><td>${r.tipo}</td></tr>`;
        });
    }
}

function irARegistro() {
    cambiarPantalla('vista-registro');
    document.querySelector('#vista-registro form').reset(); // Limpia el formulario
    document.getElementById('campo-fecha').valueAsDate = new Date(); // Pone fecha de hoy
    
    // Limpiamos la previsualización de la foto
    const imgPreview = document.getElementById('img-preview-operador');
    imgPreview.style.display = 'none';
    imgPreview.src = "";
}

// Muestra la foto pequeña cuando el operador selecciona un archivo
function mostrarPreview(event) {
    const input = event.target;
    const imgPreview = document.getElementById('img-preview-operador');

    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
        }
        reader.readAsDataURL(input.files[0]);
    } else {
        imgPreview.style.display = 'none';
        imgPreview.src = "";
    }
}

// Guardar el reporte en la Base de Datos
function guardarRegistro(e) {
    e.preventDefault();
    const btnGuardar = e.target.querySelector('button[type="submit"]');
    btnGuardar.disabled = true; // Desactivar botón para que no den doble click

    // Leemos la foto
    const reader = new FileReader();
    const file = document.getElementById('campo-foto').files[0];
    
    if (file) {
        reader.onload = function(ev) { 
            enviarDatosAlPHP(ev.target.result, btnGuardar); 
        };
        reader.readAsDataURL(file);
    } else {
        enviarDatosAlPHP(null, btnGuardar); // Sin foto
    }
}

async function enviarDatosAlPHP(fotoBase64, btn) {
    const nuevoReporte = {
        fecha: document.getElementById('campo-fecha').value,
        maquina: document.getElementById('campo-maquina').value,
        tipo: document.getElementById('campo-tipo').value,
        descripcion: document.getElementById('campo-detalles').value,
        operador: usuarioActual.nombre,
        correoOperador: usuarioActual.correo,
        foto: fotoBase64
    };

    try {
        // Alerta de "Cargando..."
        Swal.fire({
            title: 'Guardando...',
            timerProgressBar: true,
            didOpen: () => { Swal.showLoading(); }
        });

        // Enviamos a PHP
        const respuesta = await fetch('guardar_reporte.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nuevoReporte)
        });
        
        const resultado = await respuesta.json();
        
        if(resultado.success) {
            Swal.fire('¡Listo!', 'Reporte guardado con éxito.', 'success')
            .then(() => {
                cargarVistaOperador(); // Recargar tabla
            });
        } else {
            Swal.fire('Error', resultado.message, 'error');
        }

    } catch(error) {
        Swal.fire('Error', 'No se pudo conectar al servidor.', 'error');
    } finally {
        btn.disabled = false;
    }
}

// ==========================================
// 4. LÓGICA DEL ADMINISTRADOR
// ==========================================

async function cargarVistaAdmin() {
    cambiarPantalla('vista-admin');
    const tbody = document.getElementById('cuerpo-tabla-admin');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';

    await actualizarDatosDesdeServer();
    renderizarTablaAdmin(listaReportes);
}

function renderizarTablaAdmin(datos) {
    const tbody = document.getElementById('cuerpo-tabla-admin');
    tbody.innerHTML = '';
    
    if (datos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; padding: 30px; color: #6c757d;">
                    <i class="fa-solid fa-folder-open" style="font-size: 40px; margin-bottom: 10px; opacity: 0.5;"></i>
                    <p style="margin: 0; font-weight: 500;">No se encontraron registros</p>
                </td>
            </tr>`;
        return;
    }

    datos.forEach(r => {
        // --- LÓGICA DE COLORES (BADGES) ---
        let colorBadge = '#6c757d'; // Gris por defecto
        let iconoTipo = '';

        // Asignamos color según el tipo
        switch(r.tipo) {
            case 'Correctivo': 
            case 'Overhaul':
                colorBadge = '#dc3545'; // Rojo (Crítico/Urgente)
                iconoTipo = '<i class="fa-solid fa-triangle-exclamation"></i>';
                break;
            case 'Preventivo':
            case 'Lubricación':
            case 'Componentes':
                colorBadge = '#0d6efd'; // Azul (Estándar)
                iconoTipo = '<i class="fa-solid fa-calendar-check"></i>';
                break;
            case 'Predictivo':
            case 'CBM':
                colorBadge = '#6610f2'; // Violeta (Tecnológico)
                iconoTipo = '<i class="fa-solid fa-chart-line"></i>';
                break;
            case 'Proactivo':
            case 'Autónomo':
            case 'TPM':
                colorBadge = '#198754'; // Verde (Mejora continua)
                iconoTipo = '<i class="fa-solid fa-leaf"></i>';
                break;
        }

        // Creamos la etiqueta HTML bonita
        const badgeHTML = `<span style="background-color: ${colorBadge}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; white-space: nowrap;">
                              ${iconoTipo} ${r.tipo}
                           </span>`;

        // Renderizamos la fila
        tbody.innerHTML += `
            <tr class="fila-clicable">
                <td onclick="irAPreview(${r.id})">${r.fecha}</td>
                <td onclick="irAPreview(${r.id})">
                    <strong>${r.maquina}</strong><br>
                    <small>${badgeHTML}</small> </td>
                <td onclick="irAPreview(${r.id})">${r.operador}</td>
                
                <td style="text-align: right;">
                    <button onclick="irAPreview(${r.id})" class="boton btn-azul" style="font-size: 12px; padding: 6px 10px; margin-right: 5px;">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button onclick="confirmarEliminacion(${r.id})" class="boton btn-rojo" style="font-size: 12px; padding: 6px 10px;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>`;
    });
}

function filtrarTablaAdmin() {
    const textoBusqueda = document.getElementById('buscador-admin').value.toLowerCase();
    
    // Filtramos la lista global
    const filtrados = listaReportes.filter(function(r) {
        return r.maquina.toLowerCase().includes(textoBusqueda) || 
               r.operador.toLowerCase().includes(textoBusqueda);
    });
    
    renderizarTablaAdmin(filtrados);
}

// ==========================================
// 5. FUNCIÓN PARA ELIMINAR (ADMIN)
// ==========================================

function confirmarEliminacion(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "Esto borrará el reporte para siempre.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545', // Rojo
        cancelButtonColor: '#6c757d',  // Gris
        confirmButtonText: 'Sí, borrar',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            eliminarRegistroAPI(id);
        }
    });
}

async function eliminarRegistroAPI(id) {
    try {
        const respuesta = await fetch('eliminar_reporte.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            Swal.fire('Eliminado', 'El registro se borró.', 'success');
            cargarVistaAdmin(); // Recargamos la tabla para que desaparezca
        } else {
            Swal.fire('Error', 'No se pudo borrar.', 'error');
        }

    } catch (error) {
        Swal.fire('Error', 'Fallo de conexión.', 'error');
    }
}

// ==========================================
// 6. VISUALIZACIÓN DE DETALLES
// ==========================================

function irAPreview(id) {
    idRegistroSeleccionado = id;
    
    // Buscamos el reporte específico por su ID
    const reg = listaReportes.find(function(r) { return r.id == id; }); 
    
    if (!reg) return; // Si no existe, salimos

    document.getElementById('prev-maquina').innerText = reg.maquina;
    document.getElementById('prev-operador').innerText = reg.operador;
    
    const divImg = document.getElementById('prev-contenedor-img');
    
    // Si la foto tiene datos, la mostramos. Si no, texto.
    if (reg.foto && reg.foto.length > 20) {
        divImg.innerHTML = `<img src="${reg.foto}" class="img-preview">`;
    } else {
        divImg.innerText = 'Sin foto adjunta';
    }

    // Configuramos el botón para ver detalles completos
    document.getElementById('btn-ver-detalles').onclick = function() {
        irADetalles(id);
    };
    
    cambiarPantalla('vista-preview');
}

function irADetalles(id) {
    const reg = listaReportes.find(function(r) { return r.id == id; });
    
    document.getElementById('det-fecha').innerText = reg.fecha;
    document.getElementById('det-maquina').innerText = reg.maquina;
    document.getElementById('det-operador').innerText = reg.operador;
    document.getElementById('det-tipo').innerText = reg.tipo;
    document.getElementById('det-desc').innerText = reg.descripcion;
    
    cambiarPantalla('vista-detalle');
}

function volverAPreview() {
    (idRegistroSeleccionado);
}