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
    const dataToSave = { [settingId]: ctx.settings[settingId] };

    try {
        const res = await fetch(window.ayecodeSettingsFramework.ajax_url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                // THE FIX IS HERE: The 'action' parameter was missing.
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
        ctx.imagePreviews = JSON.parse(JSON.stringify(ctx.imagePreviews));
    }
}

export function renderFieldCompat(field, modelPrefix = 'settings') {
    if (window.asfFieldRenderer) {
        const fn = 'render' + field.type.charAt(0).toUpperCase() + field.type.slice(1) + 'Field';
        if (typeof window.asfFieldRenderer[fn] === 'function') return window.asfFieldRenderer[fn](field, modelPrefix);
        if (typeof window.asfFieldRenderer.renderField === 'function') return window.asfFieldRenderer.renderField(field, modelPrefix);
    }
    return `<div class="alert alert-warning">Field renderer for type "${field.type}" not found.</div>`;
}

// Computeds
export function isSettingsPage(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;
    const t = page.type;

    const nonSettingsTypes = ['form_builder', 'custom_page', 'action_page', 'import_page', 'tool_page'];
    if (nonSettingsTypes.includes(t)) return false;

    const fields = page.fields;
    if (!fields || !fields.length) return false;

    const hasSavable = (arr) => {
        const nonSavable = ['title', 'group', 'alert', 'action_button'];
        return arr.some(f => (f.type === 'group' && f.fields) ? hasSavable(f.fields) : !nonSavable.includes(f.type));
    };
    return hasSavable(fields);
}

export function hasUnsavedChanges(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;

    // Logic for Form Builder page
    if (page.type === 'form_builder') {
        const settingId = page.id;
        const currentData = ctx.settings[settingId] || [];
        const originalData = ctx.originalSettings[settingId] || [];
        return JSON.stringify(currentData) !== JSON.stringify(originalData);
    }

    // Logic for Standard Settings pages
    if (isSettingsPage(ctx)) {
        const check = (fields) => {
            for (const f of fields) {
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
        return check(page.fields || []);
    }

    // For all other page types, there are no savable changes.
    return false;
}