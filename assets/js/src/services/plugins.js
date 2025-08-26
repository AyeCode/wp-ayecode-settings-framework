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
        const syncFromDom = () => {
            const id = input.id;
            if (!id) return;
            const v = input.value;
            if (ctx.settings[id] !== v) ctx.settings[id] = v; // keep Alpine model aligned
        };

        const fireAndSync = () => {
            // Force Alpine to hear it, regardless of the plugin
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            syncFromDom();
        };

        // If the plugin already fires these, great—this is enough.
        input.addEventListener('input', syncFromDom);
        input.addEventListener('change', syncFromDom);

        // Try common icon-picker custom events (cover multiple libs)
        input.addEventListener('iconpickerSelected', fireAndSync);
        input.addEventListener('iconpickerChange', fireAndSync);
        input.addEventListener('change.bs.iconpicker', fireAndSync);
        input.addEventListener('iconpicker-selected', fireAndSync);

        // Safety: if the addon button is used to open the picker, sync after click
        const addon = input.closest('.input-group')?.querySelector('.input-group-addon, .input-group-text');
        if (addon) addon.addEventListener('click', () => setTimeout(fireAndSync, 0));
    });
}
