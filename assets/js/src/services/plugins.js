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
            // **THE FIX**: Use the same robust check here for safety.
            if (ctx.editingField && ctx.editingField._uid && Object.prototype.hasOwnProperty.call(ctx.editingField, id)) {
                if (ctx.editingField[id] !== value) ctx.editingField[id] = value;
            } else {
                if (ctx.settings[id] !== value) ctx.settings[id] = value;
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