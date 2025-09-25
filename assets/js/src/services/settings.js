// assets/js/src/services/settings.js

// Settings load/save/discard + renderer compat + computed flags
export function loadSettings(ctx) {
    ctx.settings = window.ayecodeSettingsFramework?.settings || {};
    ctx.originalSettings = JSON.parse(JSON.stringify(ctx.settings));
    ctx.imagePreviews = window.ayecodeSettingsFramework?.image_previews || {};
    ctx.originalImagePreviews = JSON.parse(JSON.stringify(ctx.imagePreviews));
}

/**
 * Validates a standard settings page before saving by checking for the 'required' attribute.
 *
 * @param {object} ctx - The Alpine.js context.
 * @returns {boolean} - True if all required fields are filled, false otherwise.
 */
function validateStandardSettings(ctx) {
    if (!ctx.activePageConfig || !ctx.activePageConfig.fields) {
        return true;
    }

    // Clear previous errors
    document.querySelectorAll('.asf-field-error').forEach(el => el.classList.remove('asf-field-error'));

    const fields = Object.values(ctx.activePageConfig.fields);

    for (const field of fields) {
        const isRequired = field.extra_attributes?.required;

        if (isRequired) {
            const value = ctx.settings[field.id];
            if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
                ctx.showNotification(`Error: The "${field.label || field.id}" field is required.`, 'error');

                // **THE FIX**: Highlight the invalid field on standard settings pages.
                const invalidEl = document.getElementById(field.id);
                if (invalidEl) {
                    const wrapper = invalidEl.closest('.row');
                    if (wrapper) {
                        wrapper.classList.add('asf-field-error');
                        wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Remove the highlight after 3.5 seconds
                        setTimeout(() => {
                            wrapper.classList.remove('asf-field-error');
                        }, 3500);
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
        return; // Stop the function if validation fails.
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


/**
 * Saves only the data for a specific setting key, typically a complex one like a form builder.
 * This prevents overwriting other settings.
 */
export async function saveFormBuilder(ctx) {
    ctx.isLoading = true;
    const settingId = ctx.activePageConfig.id;
    const sectionConfig = ctx.config.sections.find(s => s.id === settingId);

    // Keep track of the temporary UID of the field being edited, if any
    const editingUid = ctx.editingField ? ctx.editingField._uid : null;

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
                const newFieldData = hydratedData.find(f => f._uid !== editingUid && f.is_new !== true);
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

// Computeds
export function isSettingsPage(ctx) {
    const page = ctx.activePageConfig;
    if (!page) return false;
    const t = page.type;

    const nonSettingsTypes = ['form_builder', 'custom_page', 'action_page', 'import_page', 'tool_page'];
    if (nonSettingsTypes.includes(t)) return false;

    const fields = page.fields;
    if (!fields || Object.keys(fields).length === 0) {
        return false;
    }

    const hasSavable = (arr) => {
        const nonSavable = ['title', 'group', 'alert', 'action_button'];
        return arr.some(f => (f.type === 'group' && f.fields) ? hasSavable(Object.values(f.fields)) : !nonSavable.includes(f.type));
    };

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

        const sanitizedCurrent = JSON.parse(JSON.stringify(currentData)).map(f => {
            delete f.fields;
            return f;
        });
        const sanitizedOriginal = JSON.parse(JSON.stringify(originalData)).map(f => {
            delete f.fields;
            return f;
        });

        return JSON.stringify(sanitizedCurrent) !== JSON.stringify(sanitizedOriginal);
    }

    // Logic for Standard Settings pages
    if (isSettingsPage(ctx)) {
        const check = (fields) => {
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

    return false;
}