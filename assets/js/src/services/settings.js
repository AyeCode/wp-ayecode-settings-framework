// Settings load/save/discard + renderer compat + computed flags (unchanged)
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

export function discardChanges(ctx) {
    if (confirm(ctx.strings.confirm_discard)) {
        ctx.settings = JSON.parse(JSON.stringify(ctx.originalSettings));
        ctx.imagePreviews = JSON.parse(JSON.stringify(ctx.originalImagePreviews));
    }
}

export function renderFieldCompat(field) {
    if (window.asfFieldRenderer) {
        const fn = 'render' + field.type.charAt(0).toUpperCase() + field.type.slice(1) + 'Field';
        if (typeof window.asfFieldRenderer[fn] === 'function') return window.asfFieldRenderer[fn](field);
        if (typeof window.asfFieldRenderer.renderField === 'function') return window.asfFieldRenderer.renderField(field);
    }
    return `<div class="alert alert-warning">Field renderer for type "${field.type}" not found.</div>`;
}

// Computeds: unchanged logic split out for reuse
export function isSettingsPage(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;
    const t = page.type;
    if (t === 'custom_page' || t === 'action_page' || t === 'import_page' || t === 'tool_page') return false;
    const fields = page.fields;
    if (!fields || !fields.length) return false;

    const hasSavable = (arr) => {
        const nonSavable = ['title', 'group', 'alert', 'action_button'];
        return arr.some(f => (f.type === 'group' && f.fields) ? hasSavable(f.fields) : !nonSavable.includes(f.type));
    };
    return hasSavable(fields);
}

export function hasUnsavedChanges(ctx) {
    if (!isSettingsPage(ctx)) return false;
    const check = (fields) => {
        for (const f of fields) {
            if (f.type === 'group' && f.fields) { if (check(f.fields)) return true; }
            else if (f.id) {
                if (JSON.stringify(ctx.settings[f.id]) !== JSON.stringify(ctx.originalSettings[f.id])) return true;
            }
        }
        return false;
    };
    return check(ctx.activePageConfig?.fields || []);
}
