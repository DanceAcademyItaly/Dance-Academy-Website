/**
 * Dance Academy - Form Handler JavaScript
 * Gestisce l'invio del form al Google Apps Script
 */

// URL del Google Apps Script Web App (da configurare dopo il deploy)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx6UGKN4z-Z2Jojb1Kg5d4mafu6T0TFYC6irRIo8TS0m0omFmhVrTT1Dk4ATo8reAGohQ/exec';

/**
 * Inizializza la gestione del form
 */
function initFormHandler() {
    const form = document.getElementById('candidatiForm');
    
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Mostra loading
        showLoading();
        
        try {
            // Raccoglie i dati del form
            const formData = collectFormData(form);
            
            // Invia al Google Apps Script
            const response = await submitToGoogleScript(formData);
            
            if (response.success) {
                showSuccess();
                form.reset(); // Pulisce il form
            } else {
                showError(response.message || 'Errore nell\'invio');
            }
            
        } catch (error) {
            console.error('Errore nell\'invio del form:', error);
            showError('Errore di connessione. Riprova più tardi.');
        } finally {
            hideLoading();
        }
    });
}

/**
 * Raccoglie tutti i dati dal form
 */
function collectFormData(form) {
    const formData = new FormData(form);
    const data = {};
    
    // Converte FormData in oggetto normale
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    return data;
}

/**
 * Invia i dati al Google Apps Script
 */
async function submitToGoogleScript(data) {
    if (GOOGLE_SCRIPT_URL === 'INSERISCI_QUI_URL_GOOGLE_SCRIPT') {
        throw new Error('URL Google Apps Script non configurato');
    }
    
    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * Mostra indicatore di caricamento
 */
function showLoading() {
    const submitBtn = document.querySelector('.form-submit');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ INVIO IN CORSO...';
    }
}

/**
 * Nasconde indicatore di caricamento
 */
function hideLoading() {
    const submitBtn = document.querySelector('.form-submit');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'INVIA CANDIDATURA';
    }
}

/**
 * Mostra messaggio di successo
 */
function showSuccess() {
    // Crea e mostra popup di successo
    const popup = createPopup(
        'Candidatura Inviata',
        'Grazie per la tua candidatura. Ti contatteremo presto!',
        'success'
    );
    
    document.body.appendChild(popup);
    
    // Rimuovi popup dopo 5 secondi
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 5000);
}

/**
 * Mostra messaggio di errore
 */
function showError(message) {
    const popup = createPopup(
        'Errore',
        message,
        'error'
    );
    
    document.body.appendChild(popup);
    
    // Rimuovi popup dopo 7 secondi
    setTimeout(() => {
        if (popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    }, 7000);
}

/**
 * Crea popup di notifica
 */
function createPopup(title, message, type) {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';

    const popup = document.createElement('div');
    popup.className = `popup-content${type === 'success' ? ' success' : ''}`;
    
    popup.innerHTML = `
        <h3 class="popup-title${type === 'success' ? ' success' : ''}">${title}</h3>
        <p class="popup-message">${message}</p>
        <button class="popup-button" onclick="this.parentElement.parentElement.remove()">CHIUDI</button>
    `;
    
    overlay.appendChild(popup);
    
    // Chiudi cliccando sull'overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    
    return overlay;
}

