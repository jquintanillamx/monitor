// notification.js

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

function closeNotification(notification, styleElement) {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    notification.addEventListener('animationend', () => {
        notification.remove();
        removeCSS(styleElement);  // Eliminar el CSS cuando la notificación desaparezca
    });
}

export function showNotification(message, title = "Notification", type = "info", duration = 5000) {
   // const container = createNotificationContainer();


    const css = `
    
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


    let iconClass;
    switch (type) {
        case 'success':
            iconClass = 'neo-icon-check-circle';
            break;
        case 'alert':
            iconClass = 'neo-icon-error';
            break;
        case 'warning':
            iconClass = 'neo-icon-warning-outline';
            break;
        case 'info':
        default:
            iconClass = 'neo-icon-info';
            break;
    }

    const notification = document.createElement('div');
    notification.className = `neo-notification neo-notification__elevated neo-notification--${type} neo-slide neo-slide--in`;

    // Agregar atributos personalizados
    notification.setAttribute('_ngcontent-ng-c1391606298', '');
    notification.setAttribute('puppeteer-id', `toast-notification__item--100`);

    notification.innerHTML = `
        <div _ngcontent-ng-c1391606298 role="img" puppeteer-id="toast-notification__icon--100" class="neo-notification__icon ${iconClass}"></div>
        <div _ngcontent-ng-c1391606298 class="neo-notification__message">
            <div _ngcontent-ng-c1391606298 class="neo-notification__title" puppeteer-id="toast-notification__title--100">${title}</div>
            ${message}
        </div>
        <div _ngcontent-ng-c1391606298 class="neo-notification__actions">
            <div _ngcontent-ng-c1391606298 class="neo-notification__close">
                <button _ngcontent-ng-c1391606298 class="neo-icon-end" puppeteer-id="toast-notification__close--100" aria-label="Dismiss Notification Toast"></button>
            </div>
        </div>
    `;

    container.appendChild(notification);

    // Cerrar notificación al hacer clic en el botón de cerrar
    notification.querySelector('button[puppeteer-id="toast-notification__close--100"]').addEventListener('click', () => {
        closeNotification(notification, styleElement);
        console.log("presionado x not")
    });

    // Cerrar notificación después del tiempo especificado
    setTimeout(() => {
        console.log("cerrando not")
        closeNotification(notification, styleElement);
    }, duration);
}
