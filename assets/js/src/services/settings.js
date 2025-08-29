// Settings load/save/discard + renderer compat + computed flags
export function loadSettings(ctx) {
    ctx.settings = window.ayecodeSettingsFramework?.settings || {};
    ctx.originalSettings = JSON.parse(JSON.stringify(ctx.settings));
    ctx.imagePreviews = window.ayecodeSettingsFramework?.image_previews || {};
    ctx.originalImagePreviews = JSON.parse(JSON.stringify(ctx.imagePreviews));
}

export async function saveSettings(ctx) {
    ctx.isLoading = true;
    try {
        const res = await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: window.ayecodeSettingsFramework.action,
                nonce: window.ayecodeSettingsFramework.nonce,
                settings: JSON.stringify(ctx.settings)
            })
        });
        const data = await res.json();
        if (data.success) {
            ctx.originalSettings = JSON.parse(JSON.stringify(ctx.settings));
            ctx.originalImagePreviews = JSON.parse(JSON.stringify(ctx.imagePreviews));
            ctx.showNotification(data.data?.message || ctx.strings.saved, 'success');
        } else {
            ctx.showNotification(data.data?.message || ctx.strings.error, 'error');
        }
    } catch (e) {
        console.error('Save error:', e);
        ctx.showNotification(ctx.strings.error, 'error');
    } finally {
        ctx.isLoading = false;
    }
}

/**
 * Saves only the data for a specific setting key, typically a complex one like a form builder.
 * This prevents overwriting other settings.
 */
export async function saveFormBuilder(ctx) {
    ctx.isLoading = true;
    const settingId = ctx.activePageConfig.id;

    // Create a deep copy of the data to avoid modifying the live state.
    const cleanData = JSON.parse(JSON.stringify(ctx.settings[settingId]));

    // Remove the 'fields' schema array from each item.
    cleanData.forEach(field => delete field.fields);

    const dataToSave = { [settingId]: cleanData };

    try {
        const res = await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                action: window.ayecodeSettingsFramework.action,
                nonce: window.ayecodeSettingsFramework.nonce,
                settings: JSON.stringify(dataToSave),
                is_partial_save: true
            })
        });
        const data = await res.json();
        if (data.success) {
            // IMPORTANT: Only update the 'original' state for this specific setting.
            ctx.originalSettings[settingId] = JSON.parse(JSON.stringify(ctx.settings[settingId]));
            ctx.showNotification(data.data?.message || 'Form saved!', 'success');
        } else {
            ctx.showNotification(data.data?.message || ctx.strings.error, 'error');
        }
    } catch (e) {
        console.error('Save error:', e);
        ctx.showNotification(ctx.strings.error, 'error');
    } finally {
        ctx.isLoading = false;
    }
}


export function discardChanges(ctx) {
    if (confirm(ctx.strings.confirm_discard)) {
        ctx.settings = JSON.parse(JSON.stringify(ctx.originalSettings));
        ctx.imagePreviews = JSON.parse(JSON.stringify(ctx.originalImagePreviews));
    }
}

export function renderFieldCompat(field, modelPrefix = 'settings') {
    let html = '';
    if (window.asfFieldRenderer) {
        const funcName = 'render' + field.type.charAt(0).toUpperCase() + field.type.slice(1) + 'Field';
        if (typeof window.asfFieldRenderer[funcName] === 'function') {
            html = window.asfFieldRenderer[funcName](field);
        } else if (typeof window.asfFieldRenderer.renderField === 'function') {
            html = window.asfFieldRenderer.renderField(field);
        } else {
            html = `<div class="alert alert-warning">Field renderer for type "${field.type}" not found.</div>`;
        }
    } else {
        html = `<div class="alert alert-warning">Field renderer for type "${field.type}" not found.</div>`;
    }

    // If using a different model prefix (like for the form builder's editing pane),
    // replace the hardcoded "settings." with the correct prefix.
    if (modelPrefix !== 'settings') {
        const replacementRegex = new RegExp(`(x-model|:checked|@click|x-show)="(settings|\\s*settings)\\.`, 'g');
        html = html.replace(replacementRegex, `$1="${modelPrefix}.`);
    }

    return html;
}

// Computeds
export function isSettingsPage(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;
    const t = page.type;

    const nonSettingsTypes = ['form_builder', 'custom_page', 'action_page', 'import_page', 'tool_page'];
    if (nonSettingsTypes.includes(t)) return false;

    const fields = page.fields;
    // **THE FIX**: Check for fields in a way that works for both objects and arrays.
    if (!fields || Object.keys(fields).length === 0) {
        return false;
    }

    const hasSavable = (arr) => {
        const nonSavable = ['title', 'group', 'alert', 'action_button'];
        return arr.some(f => (f.type === 'group' && f.fields) ? hasSavable(Object.values(f.fields)) : !nonSavable.includes(f.type));
    };

    // **THE FIX**: Convert fields to an array before checking for savable types.
    return hasSavable(Object.values(fields));
}

export function hasUnsavedChanges(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;

    // Logic for Form Builder page
    if (page.type === 'form_builder') {
        const settingId = page.id;
        const currentData = ctx.settings[settingId] || [];
        const originalData = ctx.originalSettings[settingId] || [];

        // Create sanitized copies for comparison
        const sanitizedCurrent = JSON.parse(JSON.stringify(currentData)).map(f => {
            delete f.fields; // Remove the schema before comparing
            return f;
        });
        const sanitizedOriginal = JSON.parse(JSON.stringify(originalData)).map(f => {
            delete f.fields; // Remove the schema before comparing
            return f;
        });

        return JSON.stringify(sanitizedCurrent) !== JSON.stringify(sanitizedOriginal);
    }

    // Logic for Standard Settings pages
    if (isSettingsPage(ctx)) {
        const check = (fields) => {
            // **THE FIX**: Use Object.values to handle both arrays and objects.
            for (const f of Object.values(fields)) {
                if (f.type === 'group' && f.fields) {
                    if (check(f.fields)) return true;
                } else if (f.id) {
                    const currentValue = ctx.settings[f.id];
                    const originalValue = ctx.originalSettings[f.id];
                    if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
                        return true;
                    }
                }
            }
            return false;
        };
        return check(page.fields || {});
    }

    // For all other page types, there are no savable changes.
    return false;
}