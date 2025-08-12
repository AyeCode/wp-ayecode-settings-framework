/**
 * AyeCode Settings Framework - Field Renderer
 *
 * Contains functions for rendering HTML for various field types.
 * This can be reused in different contexts, like settings pages or setup wizards.
 */
window.asfFieldRenderer = {
    /**
     * Render a field based on its type by calling individual render functions.
     * This is the main dispatcher function.
     */
    renderField(field) {
        if (!field.type) {
            return '<div class="alert alert-warning">Invalid field configuration</div>';
        }

        // This function now returns the raw field HTML without any extra wrappers.
        switch (field.type) {
            // Handle the custom renderer type
            case 'custom_renderer':
                return this.renderCustomField(field);
            case 'text':
            case 'email':
            case 'url':
                return this.renderTextField(field);
            case 'alert':
                return this.renderAlertField(field);
            case 'password':
                return this.renderPasswordField(field);
            case 'google_api_key':
                return this.renderGoogleApiKeyField(field);
            case 'number':
                return this.renderNumberField(field);
            case 'textarea':
                return this.renderTextareaField(field);
            case 'toggle':
                return this.renderToggleField(field);
            case 'select':
                return this.renderSelectField(field);
            case 'color':
                return this.renderColorField(field);
            case 'range':
                return this.renderRangeField(field);
            case 'checkbox':
                return this.renderCheckboxField(field);
            case 'radio':
                return this.renderRadioField(field);
            case 'multiselect':
                return this.renderMultiselectField(field);
            case 'checkbox_group':
                return this.renderCheckboxGroupField(field);
            case 'group':
                return this.renderGroupField(field);
            case 'image':
                return this.renderImageField(field);
            case 'hidden':
                return this.renderHiddenField(field);
            case 'file':
                return this.renderFileField(field);
            case 'font-awesome':
                return this.renderIconField(field);
            case 'gd_map':
                return this.renderGdMapField(field);
            case 'helper_tags':
                return this.renderHelperTagsField(field);
            case 'action_button':
                return this.renderActionButtonField(field);
            case 'link_button':
                return this.renderLinkButtonField(field);
            default:
                return `<div class="alert alert-info">Unsupported field type: ${field.type}</div>`;
        }
    },

    /**
     * Renders a full-width block of helper tags that can be copied to the clipboard.
     * Each tag has a tooltip with more information.
     */
    renderHelperTagsField(field) {
        if (!field.options || typeof field.options !== 'object') {
            return '<div class="alert alert-warning">Helper tags field requires an "options" object.</div>';
        }

        let tagsHtml = '';
        for (const [key, value] of Object.entries(field.options)) {
            // Sanitize value for the HTML attribute to prevent breaking the HTML.
            const escapedValue = String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');

            // Sanitize key for the JavaScript call.
            const escapedKey = String(key).replace(/'/g, "\\'");

            tagsHtml += `
                <div class="d-inline-flex align-items-center border rounded-pill px-2 py-1 me-2 mb-2 bg-light-subtle text-body fs-xs">
                    <span 
                        class="c-pointer" 
                        @click="navigator.clipboard.writeText('${escapedKey}'); aui_toast('aui-settings-tag-copied','success','Copied to Clipboard');"
                        data-bs-toggle="tooltip"
                        data-bs-placement="top"
                        title="Click to copy"
                    >
                        ${key}
                    </span>
                    <i 
                        class="fa-solid fa-circle-question ms-2 text-muted c-pointer" 
                        data-bs-toggle="tooltip" 
                        data-bs-placement="top"
                        title="${escapedValue}"
                    ></i>
                </div>
            `;
        }

        const customDescHtml = this._renderCustomDescription(field);

        return `
            <div class="row">
                <div class="col-12">
                    <label class="form-label fw-bold mb-2">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-0 mb-2">${field.description}</p>` : ''}
                    <div class="d-flex flex-wrap align-items-center">
                        ${tagsHtml}
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    /**
     * Helper function to render a custom description with HTML support.
     * @param {object} field - The field configuration object.
     * @returns {string} A string of HTML for the custom description.
     */
    _renderCustomDescription(field) {
        if (!field.custom_desc) {
            return '';
        }
        // This allows for raw HTML. Ensure it's sanitized on the backend.
        return `<div class="form-text mt-2">${field.custom_desc}</div>`;
    },

    /**
     * Helper function to render extra HTML attributes from an object.
     * The `extra_attributes` property on a field should be an object like:
     * { 'readonly': true, 'data-foo': 'bar' }
     * @param {object} field - The field configuration object.
     * @returns {string} A string of HTML attributes.
     */
    _renderExtraAttributes(field) {
        if (!field.extra_attributes || typeof field.extra_attributes !== 'object') {
            return '';
        }

        const attributes = [];
        for (const [key, value] of Object.entries(field.extra_attributes)) {
            // Basic sanitization for the attribute name.
            const saneKey = key.replace(/[^a-zA-Z0-9-]/g, '');
            if (!saneKey) continue;

            // For boolean attributes (e.g., readonly), the presence of the attribute is enough.
            if (value === true) {
                attributes.push(saneKey);
            } else {
                // Escape the attribute value to prevent issues.
                const saneValue = String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
                attributes.push(`${saneKey}="${saneValue}"`);
            }
        }
        return attributes.join(' ');
    },

    /**
     * Renders a field by calling a globally accessible external function.
     * The function name must be provided in the 'renderer_function' property of the field config.
     */
    renderCustomField(field) {
        // Check if the renderer function name is provided
        if (!field.renderer_function || typeof field.renderer_function !== 'string') {
            return `<div class="alert alert-danger">Error: 'custom_renderer' field type requires a 'renderer_function' property specifying the function name.</div>`;
        }

        // Check if the function exists on the window object
        if (typeof window[field.renderer_function] !== 'function') {
            return `<div class="alert alert-danger">Error: The specified renderer function '${field.renderer_function}' was not found or is not a function.</div>`;
        }

        // Call the external function and pass the entire field configuration to it
        return window[field.renderer_function](field);
    },

    /**
     * Renders a GeoDirectory Map component.
     * This requires `lat_field` and `lng_field` to be defined in the field config.
     */
    renderGdMapField(field) {
        if (!field.lat_field || !field.lng_field) {
            return `<div class="alert alert-danger">Error: 'gd_map' field type requires 'lat_field' and 'lng_field' properties.</div>`;
        }

        const mapContainerId = `${field.id}_map_canvas`;
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);

        // This component calls `initGdMap` in the main Alpine app when it's added to the DOM.
        return `
            <div x-init="initGdMap('${field.id}', '${field.lat_field}', '${field.lng_field}')">
                <div class="row">
                    <div class="col-md-4">
                        <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                        ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                    </div>
                    <div class="col-md-8">
                        <div class="row g-3 mb-3">
                            <div class="col">
                                <label for="${field.lat_field}" class="form-label small">Latitude</label>
                                <input type="text" class="form-control" id="${field.lat_field}" name="${field.lat_field}" x-model="settings.${field.lat_field}" ${extraAttrs}>
                            </div>
                            <div class="col">
                                <label for="${field.lng_field}" class="form-label small">Longitude</label>
                                <input type="text" class="form-control" id="${field.lng_field}" name="${field.lng_field}" x-model="settings.${field.lng_field}" ${extraAttrs}>
                            </div>
                        </div>
                        
                        <div id="${mapContainerId}" x-ref="${field.id}_map_canvas" style="height: 350px; width: 100%;" class="border rounded bg-light">
                        </div>
                        ${customDescHtml}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renders a group of fields within a card.
     */
    renderGroupField(field) {
        let innerFieldsHtml = '';

        if (field.fields) {
            // This now correctly replicates the structure from the main PHP template.
            field.fields.forEach((subField) => {
                // We must stringify the sub-field object to pass it to the Alpine function.
                // To prevent breaking the HTML attribute, we must escape the double quotes.
                const safeSubFieldJson = JSON.stringify(subField).replace(/"/g, '&quot;');

                innerFieldsHtml += `
                    <div class="py-4" 
                         x-show="shouldShowField(${safeSubFieldJson})" 
                         x-transition 
                         x-cloak>
                        ${this.renderField(subField)}
                    </div>
                `;
            });
        }

        return `
            <div class="card mb-4 w-100 mw-100 p-0">
                <div class="card-header bg-light-subtle">
                    <h6 class="fw-bold mb-0">${field.label}</h6>
                    ${field.description ? `<p class="text-muted small mb-0 mt-1">${field.description}</p>` : ''}
                </div>
                <div class="card-body">
                    ${innerFieldsHtml}
                </div>
            </div>
        `;
    },

    /**
     * The functions below create the full two-column row for each field type.
     */
    renderTextField(field) {
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const escapedPlaceholder = (field.placeholder || '').replace(/"/g, '&quot;');
        let activePlaceholderAttrs = '';
        if (field.active_placeholder && field.placeholder) {
            const placeholderJson = JSON.stringify(field.placeholder);
            activePlaceholderAttrs = `
                @focus='if (!settings.${field.id}) { settings.${field.id} = ${placeholderJson}; }'
                @blur='if (settings.${field.id} === ${placeholderJson}) { settings.${field.id} = ""; }'
            `;
        }

        const inputHtml = `<input type="${field.type || 'text'}" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" placeholder="${escapedPlaceholder}" ${extraAttrs} ${activePlaceholderAttrs}>`;

        const finalInputHtml = field.input_group_right
            ? `<div class="input-group">${inputHtml}${field.input_group_right}</div>`
            : inputHtml;

        const customDescHtml = this._renderCustomDescription(field);

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${finalInputHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderPasswordField(field) {
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        const inputHtml = `<input type="password" autocomplete="new-password" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" placeholder="${field.placeholder || ''}" ${extraAttrs}>`;

        const finalInputHtml = field.input_group_right
            ? `<div class="input-group">${inputHtml}${field.input_group_right}</div>`
            : inputHtml;

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${finalInputHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderGoogleApiKeyField(field) {
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        const inputHtml = `<input type="password" autocomplete="new-password" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" @focus="$event.target.type = 'text'" @blur="$event.target.type = 'password'" placeholder="${field.placeholder || '••••••••••••••••••••••••••••'}" ${extraAttrs}>`;

        const finalInputHtml = field.input_group_right
            ? `<div class="input-group">${inputHtml}${field.input_group_right}</div>`
            : inputHtml;

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${finalInputHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderNumberField(field) {
        const min = field.min !== undefined ? `min="${field.min}"` : '';
        const max = field.max !== undefined ? `max="${field.max}"` : '';
        const step = field.step !== undefined ? `step="${field.step}"` : '';
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        const inputHtml = `<input type="number" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" ${min} ${max} ${step} placeholder="${field.placeholder || ''}" ${extraAttrs}>`;

        const finalInputHtml = field.input_group_right
            ? `<div class="input-group">${inputHtml}${field.input_group_right}</div>`
            : inputHtml;

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${finalInputHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderTextareaField(field) {
        const rows = field.rows || 5;
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const escapedPlaceholder = (field.placeholder || '').replace(/"/g, '&quot;');
        const customDescHtml = this._renderCustomDescription(field);
        let activePlaceholderAttrs = '';
        if (field.active_placeholder && field.placeholder) {
            const placeholderJson = JSON.stringify(field.placeholder);
            activePlaceholderAttrs = `
                @focus='if (!settings.${field.id}) { settings.${field.id} = ${placeholderJson}; }'
                @blur='if (settings.${field.id} === ${placeholderJson}) { settings.${field.id} = ""; }'
            `;
        }

        return `
            <div class="row">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <textarea class="form-control ${customClass}" id="${field.id}" name="${field.id}" rows="${rows}" x-model="settings.${field.id}" placeholder="${escapedPlaceholder}" ${extraAttrs} ${activePlaceholderAttrs}></textarea>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    /**
     * Renders a toggle switch.
     * [Corrected] Replaced x-model with a manual @click handler to prevent
     * data type changes (e.g., from 1 to true), ensuring the unsaved
     * changes check works correctly when a toggle is reverted.
     */
    renderToggleField(field) {
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="form-check form-switch">
                        <input 
                            class="form-check-input" 
                            type="checkbox" 
                            role="switch" 
                            id="${field.id}" 
                            name="${field.id}"
                            :checked="settings.${field.id} == '1' || settings.${field.id} === true"
                            @click="settings.${field.id} = (settings.${field.id} == 1 ? 0 : 1)"
                            ${extraAttrs}
                        >
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderSelectField(field) {
        let optionsHtml = '';
        if (field.placeholder) {
            optionsHtml += `<option value=""></option>`;
        }
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `<option value="${optValue}">${optLabel}</option>`;
            }
        }

        const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);

        const modelOrInit = (field.class && field.class.includes('aui-select2'))
            ? `x-ref="${field.id}" x-init="initChoice('${field.id}')"`
            : `x-model="settings.${field.id}"`;

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <select 
                        class="form-select w-100 mw-100 ${customClass}" 
                        id="${field.id}" 
                        name="${field.id}"
                        ${modelOrInit}
                        ${placeholderAttr} 
                        ${extraAttrs}
                    >
                        ${optionsHtml}
                    </select>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderRangeField(field) {
        const min = field.min || 0;
        const max = field.max || 100;
        const step = field.step || 1;
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="d-flex align-items-center">
                        <input type="range" class="form-range" id="${field.id}" name="${field.id}" min="${min}" max="${max}" step="${step}" x-model="settings.${field.id}" ${extraAttrs}>
                        <span class="badge bg-secondary ms-3" x-text="settings.${field.id}"></span>
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderCheckboxField(field) {
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row">
                <div class="col-md-4">
                     <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                </div>
                <div class="col-md-8">
                    <div class="form-check">
                        <input 
                        class="form-check-input" 
                        type="checkbox" id="${field.id}" 
                        name="${field.id}"
                        x-model="settings.${field.id}" 
                        :checked="settings.${field.id} == '1' || settings.${field.id} === true"
                        ${extraAttrs}
                        >
                        <label class="form-check-label" for="${field.id}">${field.description || ''}</label>
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderRadioField(field) {
        let optionsHtml = '';
        const extraAttrs = this._renderExtraAttributes(field);
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="${field.id}" id="${field.id}_${optValue}" value="${optValue}" x-model="settings.${field.id}" ${extraAttrs}>
                        <label class="form-check-label" for="${field.id}_${optValue}">${optLabel}</label>
                    </div>
                `;
            }
        }
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${optionsHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderMultiselectField(field) {
        const placeholderAttr = field.placeholder ? `data-placeholder="${field.placeholder}"` : '';
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);
        let optionsHtml = '';

        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `<option value="${optValue}">${optLabel}</option>`;
            }
        }

        return `
        <div class="row">
            <div class="col-md-4">
                <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
            </div>
            <div class="col-md-8">
                <select 
                    class="form-select w-100 mw-100 ${customClass}" 
                    id="${field.id}" 
                    name="${field.id}"
                    multiple 
                    x-ref="${field.id}"
                    x-init="initChoices('${field.id}')"
                    ${placeholderAttr}
                    ${extraAttrs}
                >
                    ${optionsHtml}
                </select>
                ${customDescHtml}
            </div>
        </div>
    `;
    },

    renderCheckboxGroupField(field) {
        let optionsHtml = '';
        const extraAttrs = this._renderExtraAttributes(field);
        if (field.options) {
            for (const [optValue, optLabel] of Object.entries(field.options)) {
                optionsHtml += `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${optValue}" id="${field.id}_${optValue}" name="${field.id}" x-model="settings.${field.id}" ${extraAttrs}>
                        <label class="form-check-label" for="${field.id}_${optValue}">${optLabel}</label>
                    </div>
                `;
            }
        }
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    ${optionsHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderImageField(field) {
        const customDescHtml = this._renderCustomDescription(field);
        return `
            <div class="row">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="asf-image-uploader">
                        <div class="asf-image-preview mb-2 border rounded d-flex justify-content-center align-items-center bg-light" style="width: 150px; height: 150px;">
                            <template x-if="settings.${field.id} && imagePreviews[field.id]">
                                <img :src="imagePreviews[field.id]" style="max-width: 100%; max-height: 100%; object-fit: cover;" alt="Preview" x-cloak>
                            </template>
                            <template x-if="!settings.${field.id} || !imagePreviews[field.id]">
                                <i class="fa-solid fa-image fa-2x text-muted" x-cloak></i>
                            </template>
                        </div>
                        <div>
                            <button type="button" class="btn btn-sm btn-secondary" @click.prevent="selectImage('${field.id}')">
                                <i class="fa-solid fa-pen-to-square me-1"></i> Select Image
                            </button>
                            <button type="button" class="btn btn-sm btn-danger ms-2" @click.prevent="removeImage('${field.id}')" x-show="settings.${field.id}" x-cloak>
                                <i class="fa-solid fa-trash-can me-1"></i> Remove
                            </button>
                        </div>
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderColorField(field) {
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);

        const resetButtonHtml = field.default ? `
        <button 
            type="button" 
            class="btn btn-outline-secondary ms-2" 
            title="Reset to default"
            x-cloak
            x-show="settings.${field.id} && settings.${field.id}.toLowerCase() !== '${field.default}'.toLowerCase()"
            @click="settings.${field.id} = '${field.default}'"
            data-bs-toggle="tooltip"
        >
           <i class="fa-solid fa-rotate-left"></i>
        </button>
    ` : '';

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="d-flex align-items-center">
                        <input type="color" class="form-control form-control-color me-2" id="${field.id}-color" x-model="settings.${field.id}">
                        <input 
                            type="text" 
                            class="form-control" 
                            id="${field.id}" 
                            name="${field.id}"
                            x-model="settings.${field.id}" 
                            style="max-width: 120px;" 
                            pattern="^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$" 
                            ${extraAttrs}
                        >
                        ${resetButtonHtml}
                    </div>
                    ${customDescHtml}
                </div>
            </div>`;
    },

    renderIconField(field) {
        const customClass = field.class || '';
        const extraAttrs = this._renderExtraAttributes(field);
        const customDescHtml = this._renderCustomDescription(field);

        const textAddon = field.input_group_right || '';

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <div class="input-group">
                        <input data-aui-init="iconpicker" type="text" class="form-control ${customClass}" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" placeholder="${field.placeholder || ''}" ${extraAttrs}>
                        ${textAddon}
                        <span class="input-group-addon input-group-text top-0 end-0 c-pointer"><i class="fas fa-icons"></i></span>
                    </div>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderActionButtonField(field) {
        const customDescHtml = this._renderCustomDescription(field);
        const buttonClass = field.button_class || 'btn-secondary';
        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8" >
                    <div class="d-flex align-items-center justify-content-end">
                        <div class="me-3" x-show="actionStates['${field.id}']?.message" x-cloak>
                            <span :class="actionStates['${field.id}']?.success ? 'text-success' : 'text-danger'" x-text="actionStates['${field.id}']?.message"></span>
                        </div>
                        <button type="button" id="${field.id}" class="btn ${buttonClass}" @click="executeAction('${field.id}')" :disabled="actionStates['${field.id}']?.isLoading">
                            <span x-show="actionStates['${field.id}']?.isLoading" class="spinner-border spinner-border-sm me-2" x-cloak></span>
                            <span x-text="actionStates['${field.id}']?.isLoading ? 'Processing...' : '${field.button_text || 'Run'}'"></span>
                        </button>
                    </div>
                    
                </div>
                <div class="col-md-12" x-ref="action_container_${field.id}">
                 ${customDescHtml}
                    <div class="progress mt-2" style="height: 5px;" x-show="actionStates['${field.id}']?.progress > 0 && actionStates['${field.id}']?.progress < 100" x-cloak>
                          <div class="progress-bar" role="progressbar" :style="{ width: actionStates['${field.id}']?.progress + '%' }"></div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAlertField(field) {
        const type = field.alert_type || 'info';
        return `
            <div class="alert alert-${type} mb-0">
                ${field.label ? `<h6 class="alert-heading">${field.label}</h6>` : ''}
                ${field.description || ''}
            </div>
        `;
    },

    renderLinkButtonField(field) {
        const url = field.url || '#';
        const buttonText = field.button_text || 'Click Here';
        const buttonClass = field.button_class || 'btn-secondary';
        const target = field.target ? `target="${field.target}"` : '';
        const rel = field.target === '_blank' ? 'rel="noopener noreferrer"' : '';

        const buttonHtml = `<a href="${url}" class="btn ${buttonClass}" ${target} ${rel}>${buttonText}</a>`;

        const customDescHtml = this._renderCustomDescription(field);

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8 d-flex align-items-center justify-content-end">
                    ${buttonHtml}
                    ${customDescHtml}
                </div>
            </div>
        `;
    },

    renderHiddenField(field) {
        const extraAttrs = this._renderExtraAttributes(field);
        return `<input type="hidden" id="${field.id}" name="${field.id}" x-model="settings.${field.id}" ${extraAttrs}>`;
    },

    renderFileField(field) {
        const extraAttrs = this._renderExtraAttributes(field);
        const accept = field.accept || ''; // e.g., '.csv, text/csv'
        const customDescHtml = this._renderCustomDescription(field);

        return `
            <div class="row align-items-center rounded">
                <div class="col-md-4">
                    <label for="${field.id}" class="form-label fw-bold mb-0">${field.label || field.id}</label>
                    ${field.description ? `<p class="form-text text-muted mt-1 mb-0">${field.description}</p>` : ''}
                </div>
                <div class="col-md-8">
                    <input type="file" class="form-control p-2" id="${field.id}" name="${field.id}" accept="${accept}" ${extraAttrs}>
                    ${customDescHtml}
                </div>
            </div>
        `;
    },
};