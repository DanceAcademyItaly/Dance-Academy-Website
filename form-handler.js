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

    // Inizializza validazione real-time
    initValidation(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Valida tutti i campi prima di inviare
        const validationErrors = validateForm(form);
        if (validationErrors.length > 0) {
            showValidationError(validationErrors);
            return;
        }

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
                // Rimuovi classi invalid dopo reset
                form.querySelectorAll('.invalid').forEach(field => {
                    field.classList.remove('invalid');
                });
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
    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.innerHTML = 'INVIO IN CORSO...';
    }
}

/**
 * Nasconde indicatore di caricamento
 */
function hideLoading() {
    const submitBtn = document.querySelector('.submit-button');
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
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

    // Popup rimane visibile fino a quando l'utente lo chiude manualmente
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

    // Popup rimane visibile fino a quando l'utente lo chiude manualmente
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

/**
 * Inizializza validazione real-time sui campi
 */
function initValidation(form) {
    // Valida email in real-time
    const emailField = document.querySelector('[form="candidatiForm"][name="email"]');
    if (emailField) {
        emailField.addEventListener('input', () => validateEmail(emailField));
        emailField.addEventListener('blur', () => validateEmail(emailField));
    }

    // Valida telefono in real-time
    const phoneField = document.querySelector('[form="candidatiForm"][name="telefono"]');
    if (phoneField) {
        phoneField.addEventListener('input', () => {
            // Filtra caratteri non validi mentre l'utente digita
            filterPhoneInput(phoneField);
            // Valida il formato
            validatePhone(phoneField);
        });
        phoneField.addEventListener('blur', () => validatePhone(phoneField));
    }

    // Valida provincia (dropdown non dovrebbe essere vuoto)
    const provinciaField = document.querySelector('[form="candidatiForm"][name="provincia"]');
    if (provinciaField) {
        provinciaField.addEventListener('change', () => validateProvincia(provinciaField));
    }

    // Valida anno di fondazione (deve essere 4 cifre)
    const yearField = document.querySelector('[form="candidatiForm"][name="annoFondazione"]');
    if (yearField) {
        yearField.addEventListener('input', () => {
            // Filtra solo numeri
            filterYearInput(yearField);
            // Valida il formato
            validateYear(yearField);
        });
        yearField.addEventListener('blur', () => validateYear(yearField));
    }
}

/**
 * Valida campo email
 */
function validateEmail(field) {
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Solo mostra errore se il campo è stato compilato
    if (value.length > 0 && !emailRegex.test(value)) {
        field.classList.add('invalid');
        return false;
    } else {
        field.classList.remove('invalid');
        return true;
    }
}

/**
 * Filtra input del telefono per permettere solo caratteri validi
 */
function filterPhoneInput(field) {
    const allowedChars = /[\d\s\+\-\(\)]/g;
    const value = field.value;
    const filtered = value.match(allowedChars);
    field.value = filtered ? filtered.join('') : '';
}

/**
 * Valida campo telefono
 */
function validatePhone(field) {
    const value = field.value.trim();
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;

    // Solo mostra errore se il campo è stato compilato
    if (value.length > 0 && !phoneRegex.test(value)) {
        field.classList.add('invalid');
        return false;
    } else {
        field.classList.remove('invalid');
        return true;
    }
}

/**
 * Valida campo provincia
 */
function validateProvincia(field) {
    const value = field.value;

    // Provincia deve essere selezionata (non il placeholder vuoto)
    if (!value || value === '') {
        field.classList.add('invalid');
        return false;
    } else {
        field.classList.remove('invalid');
        return true;
    }
}

/**
 * Filtra input dell'anno per permettere solo cifre
 */
function filterYearInput(field) {
    const value = field.value;
    const filtered = value.replace(/[^0-9]/g, '');
    field.value = filtered;
}

/**
 * Valida campo anno di fondazione (deve essere esattamente 4 cifre)
 */
function validateYear(field) {
    const value = field.value.trim();
    const yearRegex = /^[0-9]{4}$/;

    // Solo mostra errore se il campo è stato compilato
    if (value.length > 0 && !yearRegex.test(value)) {
        field.classList.add('invalid');
        return false;
    } else if (value.length === 4) {
        field.classList.remove('invalid');
        return true;
    } else if (value.length === 0) {
        // Campo vuoto - non mostrare errore ma non è valido
        field.classList.remove('invalid');
        return false;
    }
    return false;
}

/**
 * Valida tutti i campi del form prima dell'invio
 */
function validateForm(form) {
    const errors = [];
    const fieldNames = {
        'nomeScuola': 'Nome della scuola',
        'citta': 'Città',
        'provincia': 'Provincia',
        'indirizzo': 'Indirizzo',
        'annoFondazione': 'Anno di fondazione',
        'numeroAllievi': 'Numero di allievi',
        'nome': 'Nome',
        'cognome': 'Cognome',
        'ruolo': 'Ruolo',
        'email': 'E-mail',
        'telefono': 'N. telefono',
        'discipline': 'Discipline insegnate',
        'unicita': 'Cosa rende unica la vostra scuola',
        'contenutiSocial': 'Contenuti per i social',
        'perche': 'Perché volete partecipare',
        'disponibilita': 'Disponibilità per le riprese'
    };

    // Valida tutti i campi required
    document.querySelectorAll('[form="candidatiForm"][required]').forEach(field => {
        const value = field.value.trim();
        const fieldName = fieldNames[field.name] || field.name;

        if (!value || value === '') {
            errors.push(fieldName);
            field.classList.add('invalid');
        } else {
            // Rimuovi invalid se il campo ora è compilato correttamente
            field.classList.remove('invalid');
        }
    });

    // Valida formato email
    const emailField = document.querySelector('[form="candidatiForm"][name="email"]');
    if (emailField) {
        const emailValue = emailField.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailValue && !emailRegex.test(emailValue)) {
            if (!errors.includes('E-mail')) {
                errors.push('E-mail');
            }
            emailField.classList.add('invalid');
        } else if (emailValue) {
            // Remove invalid if email is now valid
            emailField.classList.remove('invalid');
        }
    }

    // Valida formato telefono
    const phoneField = document.querySelector('[form="candidatiForm"][name="telefono"]');
    if (phoneField) {
        const phoneValue = phoneField.value.trim();
        const phoneRegex = /^[\d\s\+\-\(\)]+$/;
        if (phoneValue && !phoneRegex.test(phoneValue)) {
            if (!errors.includes('N. telefono')) {
                errors.push('N. telefono');
            }
            phoneField.classList.add('invalid');
        } else if (phoneValue) {
            // Remove invalid if phone is now valid
            phoneField.classList.remove('invalid');
        }
    }

    // Valida provincia
    const provinciaField = document.querySelector('[form="candidatiForm"][name="provincia"]');
    if (provinciaField) {
        if (!provinciaField.value || provinciaField.value === '') {
            if (!errors.includes('Provincia')) {
                errors.push('Provincia');
            }
            provinciaField.classList.add('invalid');
        } else {
            // Remove invalid if provincia is now selected
            provinciaField.classList.remove('invalid');
        }
    }

    // Valida anno di fondazione
    const yearField = document.querySelector('[form="candidatiForm"][name="annoFondazione"]');
    if (yearField) {
        const yearValue = yearField.value.trim();
        const yearRegex = /^[0-9]{4}$/;
        if (yearValue && !yearRegex.test(yearValue)) {
            if (!errors.includes('Anno di fondazione')) {
                errors.push('Anno di fondazione');
            }
            yearField.classList.add('invalid');
        } else if (yearValue) {
            // Remove invalid if year is now valid
            yearField.classList.remove('invalid');
        }
    }

    return errors;
}

/**
 * Mostra popup con errori di validazione
 */
function showValidationError(errors) {
    const errorList = errors.join(', ');
    const message = `Campi non validi: ${errorList}`;

    const popup = createPopup(
        'Errore di Validazione',
        message,
        'error'
    );

    document.body.appendChild(popup);

    // Popup rimane visibile fino a quando l'utente lo chiude manualmente
}

/**
 * Inizializza debug button per testare form senza submit reale
 */
function initDebugButton(form) {
    const debugBtn = document.getElementById('debugFormButton');
    if (!debugBtn) return;

    debugBtn.addEventListener('click', () => {
        console.log('DEBUG: Simulando submit del form...');

        // Valida tutti i campi
        const validationErrors = validateForm(form);

        if (validationErrors.length > 0) {
            // Mostra errori di validazione
            console.log('DEBUG: Errori trovati:', validationErrors);
            showValidationError(validationErrors);
        } else {
            // Simula successo senza chiamare il Google Script
            console.log('DEBUG: Form valido! Simulando successo...');
            showLoading();

            // Simula un delay di rete
            setTimeout(() => {
                hideLoading();
                showSuccess();

                // Opzionale: resetta il form
                form.reset();
                form.querySelectorAll('.invalid').forEach(field => {
                    field.classList.remove('invalid');
                });
            }, 1000);
        }
    });
}

