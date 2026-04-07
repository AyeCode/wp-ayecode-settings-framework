// assets/js/src/services/plugins.js

// 3rd-party init + transitions + events (unchanged)
export function reinitializePlugins(ctx) {
    // Use setTimeout to allow Alpine x-transition animations to complete
    // Alpine default transition is 150ms, adding 50ms buffer = 200ms
    setTimeout(() => {
        if (typeof window.aui_init === 'function') {
            window.aui_init();
        }
        bindIconPickerModelSync(ctx);
    }, 200);
}
export function changeView(ctx, updateFn) {
    if (ctx.isChangingView) return;
    ctx.isChangingView = true; // Set flag immediately

    const pane = ctx.$refs.settingsPane; // Get the element reference
    const transitionDuration = 150; // Match CSS duration in milliseconds

    if (pane) {
        // 1. Start fade out
        pane.classList.remove('fade-in');
        pane.classList.add('fade-out');
    }

    // 2. Wait for the fade-out transition to complete
    setTimeout(() => {
        // 3. Update the underlying Alpine data (this triggers the content change via :key)
        updateFn();

        // 4. Wait for Alpine to finish updating the DOM based on the data change
        ctx.$nextTick(() => {
            if (pane) {
                // 5. Force browser reflow to ensure the fade-out style is applied
                //    before we attempt to fade back in. VERY IMPORTANT!
                void pane.offsetWidth;

                // 6. Start fade in
                pane.classList.remove('fade-out');
                pane.classList.add('fade-in');
            }

            // 7. Reinitialize plugins *after* the new content is in the DOM
            reinitializePlugins(ctx);

            // 8. Reset the isChangingView flag *after* the fade-in animation should be complete
            setTimeout(() => {
                ctx.isChangingView = false;
            }, transitionDuration);
        });
    }, transitionDuration); // Wait for fade-out before updating content
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
    },true);
    window.addEventListener('hashchange', () => ctx.handleUrlHash());
}

// Global registries to track and clean up Choices.js instances and their watchers.
window.activeChoicesInstances = window.activeChoicesInstances || {};
window.activeChoicesWatchers = window.activeChoicesWatchers || {};

export function initChoice(ctx, fieldId) {
    setTimeout(() => {
        const el = ctx.$refs[fieldId];
        if (!el) { return; }
        if (!el.classList.contains('aui-select2')) return;

        if (window.activeChoicesWatchers[fieldId]) {
            window.activeChoicesWatchers[fieldId]();
        }

        if (window.activeChoicesInstances[fieldId]) {
            window.activeChoicesInstances[fieldId].destroy();
        }

        // **THE FIX**: Check for a unique property (`_uid`) that only real field objects have.
        const modelName = (ctx.editingField && ctx.editingField._uid) ? 'editingField' : 'settings';
        const model = ctx[modelName];

        const config = window.aui_get_choices_config?.(el);
        const choices = new window.Choices(el, config);

        window.activeChoicesInstances[fieldId] = choices;

        choices.setChoiceByValue(String(model[fieldId]));

        el.addEventListener('change', () => {
            model[fieldId] = choices.getValue(true);
        });

        const unwatch = ctx.$watch(`${modelName}['${fieldId}']`, (nv) => {
            if (!choices.initialised) return;
            const cur = choices.getValue(true);
            if (nv !== cur) {
                choices.setChoiceByValue(String(nv));
            }
        });
        window.activeChoicesWatchers[fieldId] = unwatch;

    }, 0);
}

export function initChoices(ctx, fieldId) {
    setTimeout(() => {
        const el = ctx.$refs[fieldId];
        if (!el) { return; }

        if (window.activeChoicesWatchers[fieldId]) {
            window.activeChoicesWatchers[fieldId]();
        }

        if (window.activeChoicesInstances[fieldId]) {
            window.activeChoicesInstances[fieldId].destroy();
        }

        // **THE FIX**: Check for a unique property (`_uid`) that only real field objects have.
        const modelName = (ctx.editingField && ctx.editingField._uid) ? 'editingField' : 'settings';
        const model = ctx[modelName];

        if (!Array.isArray(model[fieldId])) {
            model[fieldId] = [];
        }

        const config = window.aui_get_choices_config?.(el);
        const choices = new window.Choices(el, config);

        window.activeChoicesInstances[fieldId] = choices;

        choices.setChoiceByValue(model[fieldId]);

        el.addEventListener('change', () => {
            const newValue = choices.getValue(true);
            const currentValue = model[fieldId];
            if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
                currentValue.length = 0;
                newValue.forEach(item => currentValue.push(item));
            }
        });

        const unwatch = ctx.$watch(`${modelName}['${fieldId}']`, (nv) => {
            if (!choices.initialised) return;
            const choicesValue = choices.getValue(true);
            if (JSON.stringify(nv) !== JSON.stringify(choicesValue)) {
                choices.setChoiceByValue(nv);
            }
        });
        window.activeChoicesWatchers[fieldId] = unwatch;

    }, 0);
}

function bindIconPickerModelSync(ctx) {
    const inputs = document.querySelectorAll('input[data-aui-init="iconpicker"]');

    inputs.forEach((input) => {
        const syncToAlpine = () => {
            const id = input.id;
            if (!id) return;
            const value = input.value;

            // If we're in form_builder (editingField has _uid), always update editingField
            if (ctx.editingField && ctx.editingField._uid) {
                if (ctx.editingField[id] !== value) {
                    ctx.editingField[id] = value;
                }
            } else {
                // Otherwise update settings (standard settings page)
                if (ctx.settings[id] !== value) {
                    ctx.settings[id] = value;
                }
            }
        };

        const handlePickerChange = () => {
            input.dispatchEvent(new Event('change', { bubbles: true }));
            syncToAlpine();
        };

        input.addEventListener('input', syncToAlpine);
        input.addEventListener('change', syncToAlpine);

        input.addEventListener('iconpickerSelected', handlePickerChange);
        input.addEventListener('iconpickerChange', handlePickerChange);
        input.addEventListener('change.bs.iconpicker', handlePickerChange);
        input.addEventListener('iconpicker-selected', handlePickerChange);

        const addon = input.closest('.input-group')?.querySelector('.input-group-addon, .input-group-text');
        if (addon) {
            addon.addEventListener('click', () => {
                setTimeout(handlePickerChange, 0);
            });
        }
    });
}