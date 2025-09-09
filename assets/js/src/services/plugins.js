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

// Global registries to track and clean up Choices.js instances and their watchers.
// This is necessary to prevent memory leaks and errors when components are re-rendered. @todo move this
window.activeChoicesInstances = window.activeChoicesInstances || {};
window.activeChoicesWatchers = window.activeChoicesWatchers || {};

export function initChoice(ctx, fieldId) {
    // Defer the entire initialization to the next browser task cycle. This is a
    // crucial step to prevent race conditions where a parent component re-renders
    // and destroys this element before the Choices instance is fully ready.
    setTimeout(() => {
        const el = ctx.$refs[fieldId];
        if (!el) { return; }
        if (!el.classList.contains('aui-select2')) return;

        // 1. Clean up the old watcher if it exists from a previous render.
        if (window.activeChoicesWatchers[fieldId]) {
            window.activeChoicesWatchers[fieldId](); // Call the unsubscribe function.
        }

        // 2. Clean up the old Choices instance if it exists.
        if (window.activeChoicesInstances[fieldId]) {
            window.activeChoicesInstances[fieldId].destroy();
        }

        const modelName = (ctx.editingField && ctx.editingField.hasOwnProperty(fieldId)) ? 'editingField' : 'settings';
        const model = ctx[modelName];

        const config = window.aui_get_choices_config?.(el);
        const choices = new window.Choices(el, config);

        // Store the new instance and watcher for future cleanup.
        window.activeChoicesInstances[fieldId] = choices;

        choices.setChoiceByValue(String(model[fieldId]));

        el.addEventListener('change', () => {
            model[fieldId] = choices.getValue(true);
        });

        const unwatch = ctx.$watch(`${modelName}['${fieldId}']`, (nv) => {
            if (!choices.initialised) return; // Defensive check
            const cur = choices.getValue(true);
            if (nv !== cur) {
                choices.setChoiceByValue(String(nv));
            }
        });
        window.activeChoicesWatchers[fieldId] = unwatch;

    }, 0);
}

export function initChoices(ctx, fieldId) {
    // Defer the entire initialization to the next browser task cycle. This is a
    // crucial step to prevent race conditions where a parent component re-renders
    // and destroys this element before the Choices instance is fully ready.
    setTimeout(() => {
        const el = ctx.$refs[fieldId];
        if (!el) { return; }

        // 1. Clean up the old watcher if it exists from a previous render.
        if (window.activeChoicesWatchers[fieldId]) {
            window.activeChoicesWatchers[fieldId](); // Call the unsubscribe function.
        }

        // 2. Clean up the old Choices instance if it exists.
        if (window.activeChoicesInstances[fieldId]) {
            window.activeChoicesInstances[fieldId].destroy();
        }

        const modelName = (ctx.editingField && ctx.editingField.hasOwnProperty(fieldId)) ? 'editingField' : 'settings';
        const model = ctx[modelName];

        if (!Array.isArray(model[fieldId])) {
            model[fieldId] = [];
        }

        const config = window.aui_get_choices_config?.(el);
        const choices = new window.Choices(el, config);

        // Store the new instance and watcher for future cleanup.
        window.activeChoicesInstances[fieldId] = choices;

        choices.setChoiceByValue(model[fieldId]);

        el.addEventListener('change', () => {
            const newValue = choices.getValue(true);
            const currentValue = model[fieldId];
            // Mutate the array in-place to prevent a destructive re-render.
            if (JSON.stringify(currentValue) !== JSON.stringify(newValue)) {
                currentValue.length = 0;
                newValue.forEach(item => currentValue.push(item));
            }
        });

        const unwatch = ctx.$watch(`${modelName}['${fieldId}']`, (nv) => {
            if (!choices.initialised) return; // Defensive check
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