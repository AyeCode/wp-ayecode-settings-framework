// assets/js/src/services/plugins.js

// 3rd-party init + transitions + events (unchanged)
export function reinitializePlugins(ctx) {
    ctx.$nextTick(() => {
        console.log('Re-initializing...');
        if (typeof window.aui_init === 'function') window.aui_init();
        bindIconPickerModelSync(ctx);
    });
}
export function changeView(ctx, updateFn) {
    if (ctx.isChangingView) return;
    ctx.isChangingView = true;
    setTimeout(() => {
        updateFn();
        ctx.$nextTick(() => {
            ctx.isChangingView = false;
            reinitializePlugins(ctx);
        });
    }, 150);
}
export function setupEventListeners(ctx) {
    window.addEventListener('beforeunload', (e) => {
        if (ctx.hasUnsavedChanges || ctx.isActionRunning) {
            e.preventDefault();
            e.returnValue = 'A task is running or you have unsaved changes. Are you sure you want to leave?';
        }
    });
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); ctx.searchModal?.show?.(); }
    });
    window.addEventListener('hashchange', () => ctx.handleUrlHash());
}

// Choices helpers (moved here)
export function initChoice(ctx, fieldId) {
    const el = ctx.$refs[fieldId];
    if (!el) { console.error(`Choices.js init failed: x-ref="${fieldId}" not found.`); return; }
    if (!el.classList.contains('aui-select2')) return;
    const config = window.aui_get_choices_config?.(el);
    const choices = new window.Choices(el, config);
    choices.setChoiceByValue(String(ctx.settings[fieldId]));
    el.addEventListener('change', () => { ctx.settings[fieldId] = choices.getValue(true); });
    ctx.$watch?.(`settings['${fieldId}']`, (nv) => {
        const cur = choices.getValue(true);
        if (nv !== cur) choices.setChoiceByValue(String(nv));
    });
}
export function initChoices(ctx, fieldId) {
    const el = ctx.$refs[fieldId];
    if (!el) { console.error(`Choices.js init failed: x-ref="${fieldId}" not found.`); return; }
    if (!Array.isArray(ctx.settings[fieldId])) ctx.settings[fieldId] = [];
    const config = window.aui_get_choices_config?.(el);
    const choices = new window.Choices(el, config);
    choices.setChoiceByValue(ctx.settings[fieldId]);
    el.addEventListener('change', () => { ctx.settings[fieldId] = choices.getValue(true); });
    ctx.$watch?.(`settings['${fieldId}']`, (nv) => {
        if (JSON.stringify(nv) !== JSON.stringify(choices.getValue(true))) choices.setChoiceByValue(nv);
    });
}

function bindIconPickerModelSync(ctx) {
    const inputs = document.querySelectorAll('input[data-aui-init="iconpicker"]');

    inputs.forEach((input) => {
        // Simple function to ensure the Alpine model is updated
        const syncToAlpine = () => {
            const id = input.id;
            if (!id) return;
            const value = input.value;
            // This directly sets the value in the correct model (settings or editingField)
            if (ctx.editingField && ctx.editingField.hasOwnProperty(id)) {
                if (ctx.editingField[id] !== value) ctx.editingField[id] = value;
            } else {
                if (ctx.settings[id] !== value) ctx.settings[id] = value;
            }
        };

        // This function is called by the icon picker's custom events
        const handlePickerChange = () => {
            // Programmatically dispatch a 'change' event.
            // This is the key part that tells Alpine to update its state.
            input.dispatchEvent(new Event('change', { bubbles: true }));
            syncToAlpine();
        };

        // Listen for standard events for manual input
        input.addEventListener('input', syncToAlpine);
        input.addEventListener('change', syncToAlpine);

        // Listen for the icon picker's specific events
        // Different libraries use different event names, so we listen for several common ones.
        input.addEventListener('iconpickerSelected', handlePickerChange);
        input.addEventListener('iconpickerChange', handlePickerChange);
        input.addEventListener('change.bs.iconpicker', handlePickerChange); // For bootstrap-iconpicker
        input.addEventListener('iconpicker-selected', handlePickerChange);

        // A fallback for when the popup-opening button is clicked
        const addon = input.closest('.input-group')?.querySelector('.input-group-addon, .input-group-text');
        if (addon) {
            addon.addEventListener('click', () => {
                // After opening, we might need a brief moment for the picker to be ready
                setTimeout(handlePickerChange, 0);
            });
        }
    });
}