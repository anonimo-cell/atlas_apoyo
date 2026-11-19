function pintarBotonLogin() {
    const sesionIniciada = localStorage.getItem('sesionIniciada') === '1';
    const textoSesion = sesionIniciada ? 'Cerrar sesión' : 'Iniciar sesión';
    const boton = document.getElementById('mi-boton-login');
    const textoMovil = document.getElementById('menu-movil-sesion-texto');
    const botonMovil = document.getElementById('menu-movil-sesion');

    if (boton) {
        boton.textContent = textoSesion;
        boton.classList.toggle('btn-sesion-activa', sesionIniciada);
    }
    if (textoMovil) textoMovil.textContent = textoSesion;
    if (botonMovil) {
        botonMovil.classList.toggle('menu-movil-sesion-activa', sesionIniciada);
        botonMovil.setAttribute('aria-label', textoSesion);
    }
}

async function gestionarClickLogin() {
    if (localStorage.getItem('sesionIniciada') === '1') {
        abrirModal('modal-confirmar-cierre-sesion');
        return;
    }

    abrirModal('modal-login');
}

async function confirmarCierreSesion() {
    const boton = document.getElementById('btn-confirmar-cierre-sesion');
    const mensajeError = document.getElementById('mensaje-error-cierre-sesion');

    if (!window.supabase || !window.supabase.auth) {
        console.error('No está disponible la conexión de autenticación para cerrar sesión.');
        mensajeError.textContent = 'No se pudo conectar para cerrar sesión. Inténtalo de nuevo más tarde.';
        mensajeError.style.display = 'block';
        return;
    }

    mensajeError.style.display = 'none';
    boton.disabled = true;
    try {
        const { error } = await window.supabase.auth.signOut();
        if (error) throw error;
        actualizarEstadoSesion(null);
        cerrarModal('modal-confirmar-cierre-sesion');
        anunciar('Has cerrado la sesión');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        mensajeError.textContent = 'No se pudo cerrar la sesión. Inténtalo de nuevo.';
        mensajeError.style.display = 'block';
        anunciar('No se pudo cerrar la sesión. Inténtalo de nuevo.');
    } finally {
        boton.disabled = false;
    }
}

function nombreVisibleDe(user) {
    if (!user) return '';
    return (user.user_metadata && user.user_metadata.nombre) || (user.email || '').split('@')[0];
}

function actualizarEstadoSesion(session) {
    const user = session && session.user;
    if (user) {
        localStorage.setItem('sesionIniciada', '1');
        localStorage.setItem('nombreUsuario', nombreVisibleDe(user));
    } else {
        localStorage.removeItem('sesionIniciada');
        localStorage.removeItem('nombreUsuario');
    }
    pintarBotonLogin();
}

async function simularInicioSesionModal() {
    const campoUsuario = document.getElementById('login-usuario-modal');
    const campoPass = document.getElementById('login-password-modal');
    const mensajeError = document.getElementById('mensaje-error-login-modal');
    const botonEnviar = document.getElementById('btn-login-modal');
    const usuarioInput = campoUsuario.value.trim();
    const pass = campoPass.value.trim();

    campoUsuario.classList.toggle('campo-error', !usuarioInput);
    campoPass.classList.toggle('campo-error', !pass);
    if (!usuarioInput || !pass) {
        mensajeError.textContent = !usuarioInput && !pass
            ? 'Falta rellenar el correo o usuario y la contraseña'
            : !usuarioInput
                ? 'Falta rellenar el correo o usuario'
                : 'Falta rellenar la contraseña';
        mensajeError.style.display = 'block';
        (!usuarioInput ? campoUsuario : campoPass).focus();
        return;
    }

    if (!window.supabase || !window.supabase.auth) {
        mensajeError.textContent = 'No se pudo conectar con el servicio de inicio de sesión. Inténtalo de nuevo más tarde.';
        mensajeError.style.display = 'block';
        console.error('El cliente de Supabase no está disponible.');
        return;
    }

    mensajeError.style.display = 'none';
    botonEnviar.disabled = true;
    try {
        let email = usuarioInput.toLowerCase();
        if (!usuarioInput.includes('@')) {
            const { data: correo, error: errorCorreo } = await window.supabase.rpc('correo_de_usuario', {
                nombre_usuario: usuarioInput,
                contrasena: pass
            });
            if (errorCorreo) throw errorCorreo;
            if (!correo) {
                const errorCredenciales = new Error('Usuario o contraseña incorrectos');
                errorCredenciales.code = 'invalid_credentials';
                throw errorCredenciales;
            }
            email = correo;
        }

        const { data, error } = await window.supabase.auth.signInWithPassword({
            email,
            password: pass
        });
        if (error) throw error;

        actualizarEstadoSesion(data.session);
        cerrarModal('modal-login');
        anunciar('Has iniciado sesión correctamente');
    } catch (error) {
        console.error('Error de inicio de sesión:', error);
        mensajeError.textContent = error.code === 'email_not_confirmed' || /not confirmed/i.test(error.message || '')
            ? 'Todavía no has confirmado tu correo. Revisa tu bandeja de entrada.'
            : usuarioInput.includes('@')
                ? 'Correo o contraseña incorrectos'
                : 'Usuario o contraseña incorrectos';
        mensajeError.style.display = 'block';
    } finally {
        botonEnviar.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const modalLogin = document.getElementById('modal-login');
    const campoUsuario = document.getElementById('login-usuario-modal');
    const campoPass = document.getElementById('login-password-modal');
    const mensajeError = document.getElementById('mensaje-error-login-modal');
    const modalCierreSesion = document.getElementById('modal-confirmar-cierre-sesion');
    const mensajeErrorCierreSesion = document.getElementById('mensaje-error-cierre-sesion');
    const botonConfirmarCierre = document.getElementById('btn-confirmar-cierre-sesion');

    modalLogin.addEventListener('close', () => {
        if (localStorage.getItem('sesionIniciada') !== '1') {
            campoUsuario.classList.remove('campo-error');
            campoPass.classList.remove('campo-error');
        }
        mensajeError.style.display = 'none';
    });

    modalCierreSesion.addEventListener('close', () => {
        mensajeErrorCierreSesion.style.display = 'none';
        botonConfirmarCierre.disabled = false;
    });

    [campoUsuario, campoPass].forEach(campo => {
        campo.addEventListener('input', () => {
            if (campo.value.trim()) campo.classList.remove('campo-error');
            if (!document.querySelector('#modal-login .campo-error')) {
                mensajeError.style.display = 'none';
            }
        });
    });

    if (!window.supabase || !window.supabase.auth) {
        console.error('No se pudo inicializar el cliente de Supabase.');
        return;
    }

    window.supabase.auth.onAuthStateChange((_event, session) => {
        window.setTimeout(() => actualizarEstadoSesion(session), 0);
    });

    window.supabase.auth.getSession()
        .then(({ data, error }) => {
            if (error) throw error;
            actualizarEstadoSesion(data.session);
        })
        .catch(error => {
            console.error('No se pudo comprobar la sesión:', error);
        });
});
