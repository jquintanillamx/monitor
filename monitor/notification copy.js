// notification.js

// Función para inyectar estilos CSS dinámicamente
function injectCSS(css) {
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamicNotificationStyles';
    styleElement.textContent = css;
    document.head.appendChild(styleElement);
    return styleElement;
}

// Función para eliminar los estilos CSS
function removeCSS(styleElement) {
    if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
    }
}

// Función para crear el contenedor de notificaciones
function createNotificationContainer() {
    let container = document.getElementById('uwfNotificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'uwfNotificationContainer';
        container.className = 'uwf-notification-container';
        document.body.appendChild(container);
    }
    return container;
}

// Función para cerrar notificación
function closeNotification(notification, styleElement) {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    notification.addEventListener('animationend', () => {
        notification.remove();
        removeCSS(styleElement);  // Eliminar el CSS cuando la notificación desaparezca
    });
}

// Función exportable para mostrar notificación
export function showNotification(message, title = "Notification", type = "info", duration = 5000) {
    // Inyectar el CSS dinámicamente
    const css = `
        .uwf-notification-container {
            position: fixed;
            bottom: 10px;
            left: 10px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .neo-notification {
            display: flex;
            align-items: center;
            padding: 15px;
            border-radius: 5px;
            box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-in-out;
        }
        .neo-notification--info {
            background-color: #2196F3; /* Azul para información */
        }
        .neo-notification--success {
            background-color: #4CAF50; /* Verde para éxito */
        }
        .neo-notification--warning {
            background-color: #ffcc00; /* Amarillo para advertencia */
        }
        .neo-notification--error {
            background-color: #f44336; /* Rojo para error */
        }
        .neo-notification__icon {
            margin-right: 10px;
            font-size: 24px;
        }
        .neo-notification__message {
            flex-grow: 1;
        }
        .neo-notification__title {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .neo-notification__close button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
        }
        @keyframes slideIn {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(-100%);
                opacity: 0;
            }
        }
    `;
    const styleElement = injectCSS(css);

    const container = createNotificationContainer();

    // Determinar el ícono según el tipo de notificación
    let icon;
    switch (type) {
        case 'success':
            icon = '&#10004;'; // ✔️
            break;
        case 'error':
            icon = '&#10060;'; // ❌
            break;
        case 'warning':
            icon = '&#9888;'; // ⚠️
            break;
        case 'info':
        default:
            icon = '&#8505;'; // ℹ️
            break;
    }

    const notification = document.createElement('div');
    notification.className = `neo-notification neo-notification--${type} neo-slide--in`;

    notification.innerHTML = `
        <div class="neo-notification__icon">${icon}</div> <!-- Icono dinámico -->
        <div class="neo-notification__message">
            <div class="neo-notification__title">${title}</div>
            <div>${message}</div>
        </div>
        <div class="neo-notification__actions">
            <div class="neo-notification__close"><button aria-label="Dismiss Notification Toast">&times;</button></div>
        </div>
    `;

    container.appendChild(notification);

    // Cerrar notificación al hacer clic en el botón de cerrar
    notification.querySelector('.neo-notification__close button').addEventListener('click', () => {
        closeNotification(notification, styleElement);
    });

    // Cerrar notificación después del tiempo especificado
    setTimeout(() => {
        closeNotification(notification, styleElement);
    }, duration);
}
