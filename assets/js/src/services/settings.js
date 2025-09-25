// assets/js/src/services/settings.js

/**
 * Recursively removes empty arrays and objects from a value.
 * This is used to ensure only meaningful data changes trigger the "unsaved" status.
 * @param {*} value The value to clean.
 * @returns {*} The cleaned value.
 */
function removeEmpty(value) {
    if (Array.isArray(value)) {
        if (value.length === 0) return undefined;
        const cleanedArray = value.map(removeEmpty).filter(v => v !== undefined);
        return cleanedArray.length > 0 ? cleanedArray : undefined;
    }
    if (typeof value === 'object' && value !== null) {
        const cleaned = Object.entries(value)
            .reduce((acc, [key, val]) => {
                const cleanedVal = removeEmpty(val);
                if (cleanedVal !== undefined) acc[key] = cleanedVal;
                return acc;
            }, {});
        if (Object.keys(cleaned).length === 0) return undefined;
        return cleaned;
    }
    return value;
}


/**
 * Determines if the current page is a standard settings page (and not a tool, form builder, etc.).
 * @param {object} ctx The Alpine.js context.
 * @returns {boolean}
 */
export function isSettingsPage(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;

    const nonSettingsTypes = ['form_builder', 'custom_page', 'action_page', 'import_page', 'tool_page'];
    if (nonSettingsTypes.includes(page.type)) return false;

    const fields = page.fields;
    // **THE FIX**: Handle both Array and Object types for the 'fields' property.
    const fieldCollection = Array.isArray(fields) ? fields : (typeof fields === 'object' && fields !== null) ? Object.values(fields) : [];

    if (fieldCollection.length === 0) {
        return false;
    }

    const hasSavable = (arr) => {
        const nonSavableTypes = ['title', 'group', 'alert', 'action_button'];
        return arr.some(field => {
            if (field.type === 'group' && field.fields) {
                const innerFields = Array.isArray(field.fields) ? field.fields : Object.values(field.fields);
                return hasSavable(innerFields);
            }
            return !nonSavableTypes.includes(field.type);
        });
    };

    return hasSavable(fieldCollection);
}

/**
 * Checks if there are any unsaved changes on the current page.
 * @param {object} ctx The Alpine.js context.
 * @returns {boolean}
 */
export function hasUnsavedChanges(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;

    // Logic for the Form Builder page.
    if (page.type === 'form_builder') {
        const settingId = page.id;
        const currentData = ctx.settings[settingId] || [];
        const originalData = ctx.originalSettings[settingId] || [];

        const sanitizedCurrent = JSON.parse(JSON.stringify(currentData)).map(f => {
            delete f.fields; // Remove transient 'fields' schema property before comparison.
            return f;
        });
        const sanitizedOriginal = JSON.parse(JSON.stringify(originalData)).map(f => {
            delete f.fields;
            return f;
        });

        // Use the deep clean utility to ignore meaningless differences.
        const cleanCurrent = removeEmpty(sanitizedCurrent);
        const cleanOriginal = removeEmpty(sanitizedOriginal);

        return JSON.stringify(cleanCurrent) !== JSON.stringify(cleanOriginal);
    }

    // Logic for standard settings pages.
    if (isSettingsPage(ctx)) {
        const fields = Array.isArray(page.fields) ? page.fields : Object.values(page.fields || {});
        const checkFieldsForChanges = (fieldArray) => {
            for (const field of fieldArray) {
                if (field.type === 'group' && field.fields) {
                    const innerFields = Array.isArray(field.fields) ? field.fields : Object.values(field.fields);
                    if (checkFieldsForChanges(innerFields)) return true;
                } else if (field.id) {
                    const currentValue = ctx.settings[field.id];
                    const originalValue = ctx.originalSettings[field.id];
                    if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
                        return true;
                    }
                }
            }
            return false;
        };
        return checkFieldsForChanges(fields);
    }

    return false;
}


// --- The rest of your service functions ---

export function loadSettings(ctx) {
    ctx.settings = window.ayecodeSettingsFramework?.settings || {};
    ctx.originalSettings = JSON.parse(JSON.stringify(ctx.settings));
    ctx.imagePreviews = window.ayecodeSettingsFramework?.image_previews || {};
    ctx.originalImagePreviews = JSON.parse(JSON.stringify(ctx.imagePreviews));
}

function validateStandardSettings(ctx) {
    if (!ctx.activePageConfig || !ctx.activePageConfig.fields) {
        return true;
    }
    document.querySelectorAll('.asf-field-error').forEach(el => el.classList.remove('asf-field-error'));
    const fields = Array.isArray(ctx.activePageConfig.fields) ? ctx.activePageConfig.fields : Object.values(ctx.activePageConfig.fields);
    for (const field of fields) {
        if (field.extra_attributes?.required) {
            const value = ctx.settings[field.id];
            if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                ctx.showNotification(`Error: The "${field.label || field.id}" field is required.`, 'error');
                const invalidEl = document.getElementById(field.id);
                if (invalidEl) {
                    const wrapper = invalidEl.closest('.row');
                    if (wrapper) {
                        wrapper.classList.add('asf-field-error');
                        wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => wrapper.classList.remove('asf-field-error'), 3500);
                    }
                }
                return false;
            }
        }
    }
    return true;
}

export async function saveSettings(ctx) {
    if (!validateStandardSettings(ctx)) {
        return;
    }
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
            ctx.settings = data.data.settings;
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

export async function saveFormBuilder(ctx) {
    ctx.isLoading = true;
    const settingId = ctx.activePageConfig.id;
    const sectionConfig = ctx.config.sections.find(s => s.id === settingId);
    const editingUid = ctx.editingField ? ctx.editingField._uid : null;
    const cleanData = JSON.parse(JSON.stringify(ctx.settings[settingId]));
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
            const freshDataFromServer = data.data.settings[settingId];
            const templates = sectionConfig.templates.flatMap(g => g.options);
            const hydratedData = freshDataFromServer.map(savedField => {
                const template = templates.find(t => t.id === savedField.template_id);
                if (template) {
                    savedField.fields = template.fields;
                }
                return savedField;
            });
            ctx.settings[settingId] = hydratedData;
            ctx.originalSettings[settingId] = JSON.parse(JSON.stringify(hydratedData));
            if (editingUid && editingUid.toString().startsWith('new_')) {
                const stillEditing = hydratedData.find(field => field.template_id === ctx.editingField.template_id && !ctx.originalSettings[settingId].some(orig => orig._uid === field._uid));
                if (stillEditing) {
                    ctx.editingField = stillEditing;
                }
            }
            ctx.leftColumnView = 'field_list';
            ctx.editingField = window.__ASF_NULL_FIELD;
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

    if (modelPrefix !== 'settings') {
        const replacementRegex = new RegExp(`(x-model|:checked|@click|x-show)="(settings|\\s*settings)\\.`, 'g');
        html = html.replace(replacementRegex, `$1="${modelPrefix}.`);
    }

    return html;
}