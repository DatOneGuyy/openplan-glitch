const dialogModal = document.getElementById('dialogModal');
const dialogTitle = document.getElementById('dialogTitle');
const dialogMessage = document.getElementById('dialogMessage');
const dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
const dialogCancelBtn = document.getElementById('dialogCancelBtn');

/**
 * Shows a custom confirmation dialog.
 * @param {string} message - The message to display.
 * @param {string} title - The title of the dialog.
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
 */
export function showConfirm(message, title = 'Confirm Action') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'block';
        dialogConfirmBtn.textContent = 'Confirm';
        
        dialogModal.style.display = 'flex';

        const onConfirm = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            dialogCancelBtn.removeEventListener('click', onCancel);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        dialogCancelBtn.addEventListener('click', onCancel);
        window.addEventListener('keydown', onKeyDown);
    });
}

/**
 * Shows a custom alert dialog.
 * @param {string} message - The message to display.
 * @param {string} title - The title of the dialog.
 * @returns {Promise<void>} - Resolves when the user clicks OK.
 */
export function showAlert(message, title = 'Alert') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'none';
        dialogConfirmBtn.textContent = 'OK';
        
        dialogModal.style.display = 'flex';

        const onConfirm = () => {
            cleanup();
            resolve();
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        window.addEventListener('keydown', onKeyDown);
    });
}

/**
 * Shows a custom prompt dialog.
 * @param {string} message - The label for the input.
 * @param {string} title - The title of the dialog.
 * @param {string} defaultValue - The initial value for the input.
 * @returns {Promise<string|null>} - Resolves to the string if confirmed, null otherwise.
 */
export function showPrompt(message, title = 'Project Name', defaultValue = '') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'block';
        dialogConfirmBtn.textContent = 'Save';

        // Add input field
        const inputContainer = document.createElement('div');
        inputContainer.className = 'modal-input-group';
        inputContainer.style.marginTop = '16px';
        inputContainer.innerHTML = `<input type="text" id="dialogInput" value="${defaultValue}" style="width: 100%;">`;
        dialogMessage.appendChild(inputContainer);

        const input = document.getElementById('dialogInput');
        
        dialogModal.style.display = 'flex';
        input.focus();
        input.select();

        const onConfirm = () => {
            const value = input.value.trim();
            cleanup();
            resolve(value || 'Untitled Room');
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            inputContainer.remove();
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            dialogCancelBtn.removeEventListener('click', onCancel);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        dialogCancelBtn.addEventListener('click', onCancel);
        window.addEventListener('keydown', onKeyDown);
    });
}

/**
 * Shows a dialog informing the user that authentication is required.
 * Redirects to /login if they click "Log In".
 */
export function showAuthRequired(message = 'Please log in to access this feature.', title = 'Authentication Required') {
    return new Promise((resolve) => {
        dialogTitle.textContent = title;
        dialogMessage.textContent = message;
        dialogCancelBtn.style.display = 'block';
        dialogConfirmBtn.textContent = 'Log In';
        
        dialogModal.style.display = 'flex';

        const onConfirm = () => {
            cleanup();
            window.location.href = '/login';
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
            if (e.key === 'Enter') onConfirm();
        };

        const cleanup = () => {
            dialogModal.style.display = 'none';
            dialogConfirmBtn.removeEventListener('click', onConfirm);
            dialogCancelBtn.removeEventListener('click', onCancel);
            window.removeEventListener('keydown', onKeyDown);
        };

        dialogConfirmBtn.addEventListener('click', onConfirm);
        dialogCancelBtn.addEventListener('click', onCancel);
        window.addEventListener('keydown', onKeyDown);
    });
}
