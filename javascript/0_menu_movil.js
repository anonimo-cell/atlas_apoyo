function abrirMenuMovil() {
    if (typeof pintarBotonLogin === 'function') pintarBotonLogin();
    abrirModal('menu-movil');
}

function opcionMenuMovil(opcion) {
    cerrarModal('menu-movil');

    if (opcion === 'sesion') {
        gestionarClickLogin();
        return;
    }
    abrirModal(opcion);
}

document.addEventListener('DOMContentLoaded', () => {
    const menu = document.getElementById('menu-movil');
    if (!menu) return;

    menu.addEventListener('click', evento => {
        if (evento.target === menu) menu.close();
    });
});
